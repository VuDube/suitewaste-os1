import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor, useDroppable, UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';
import { useOperationsRoutes } from '@/lib/api';
// Mock data for tasks until API is ready
const initialTasks: Record<string, { id: string; content: string }[]> = {
  unassigned: [
    { id: 'T001', content: 'Special pickup at Sandton City' },
    { id: 'T002', content: 'E-waste collection from Midrand Corp' },
    { id: 'T003', content: 'Bulk waste removal in Soweto' },
  ],
  R001: [{ id: 'T004', content: 'Standard residential collection' }],
  R002: [],
  R003: [{ id: 'T005', content: 'Industrial park clearing' }],
};
const joburgCenter: L.LatLngExpression = [-26.2041, 28.0473];
const truckIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const TaskCard = ({ id, content }: { id: string; content: string }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="p-2.5 mb-2 bg-card border rounded-md shadow-sm flex items-center min-h-[44px] md:min-h-auto">
      <button {...listeners} className="cursor-grab p-1 -ml-1 mr-2 text-muted-foreground touch-none"><GripVertical size={16} /></button>
      <p className="text-sm flex-1">{content}</p>
    </div>
  );
};
const TaskColumn = ({ id, title, tasks }: { id: string; title: string; tasks: { id: string; content: string }[] }) => {
  const { setNodeRef } = useDroppable({ id });
  const taskIds = tasks.map(t => t.id);
  return (
    <Card className="flex-1 min-w-[250px] flex flex-col">
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <ScrollArea className="flex-1">
        <CardContent ref={setNodeRef} className="h-full p-4">
          <SortableContext id={id} items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map(task => <TaskCard key={task.id} id={task.id} content={task.content} />)}
          </SortableContext>
        </CardContent>
      </ScrollArea>
    </Card>
  );
};
const OperationsApp: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState(initialTasks);
  const { data: routesData, isLoading: isLoadingRoutes } = useOperationsRoutes();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(joburgCenter, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);
    }
    if (mapInstance.current && routesData) {
      // Clear existing markers
      mapInstance.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapInstance.current?.removeLayer(layer);
        }
      });
      // Add new markers
      routesData.forEach(route => {
        if (route.positions && route.positions.length > 0) {
          const pos: L.LatLngExpression = [route.positions[0].lat, route.positions[0].lng];
          L.marker(pos, { icon: truckIcon })
            .addTo(mapInstance.current!)
            .bindPopup(route.name);
        }
      });
    }
    // Invalidate size on window resize to fix map rendering issues
    const resizeObserver = new ResizeObserver(() => {
      mapInstance.current?.invalidateSize();
    });
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }
    return () => {
      if (mapRef.current) {
        resizeObserver.unobserve(mapRef.current);
      }
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [routesData]);
  const findContainer = (id: UniqueIdentifier) => {
    const idStr = String(id);
    if (idStr in tasks) return idStr;
    return Object.keys(tasks).find(key => tasks[key].some(item => item.id === idStr));
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (activeId === overId) return;
    const activeContainer = findContainer(active.id);
    const overContainer = findContainer(over.id);
    if (!activeContainer || !overContainer) return;
    setTasks(prev => {
      const newTasks = { ...prev };
      const activeItems = newTasks[activeContainer];
      const overItems = newTasks[overContainer];
      const activeIndex = activeItems.findIndex(item => item.id === activeId);
      if (activeContainer === overContainer) {
        const overIndex = overItems.findIndex(item => item.id === overId);
        const [movedItem] = activeItems.splice(activeIndex, 1);
        activeItems.splice(overIndex, 0, movedItem);
      } else {
        const [movedItem] = activeItems.splice(activeIndex, 1);
        const overIsContainer = overId in newTasks;
        if (overIsContainer) {
          newTasks[overId].push(movedItem);
        } else {
          const overItemIndex = overItems.findIndex(item => item.id === overId);
          overItems.splice(overItemIndex, 0, movedItem);
        }
      }
      return newTasks;
    });
  };
  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 md:flex-[2] bg-muted relative h-1/2 md:h-full">
        {isLoadingRoutes && <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>}
        <div ref={mapRef} className="h-full w-full" />
      </div>
      <div className="flex-1 border-t md:border-t-0 md:border-l p-4 flex flex-col h-1/2 md:h-full">
        <h2 className="text-xl font-bold mb-4">{t('apps.operations.taskBoard')}</h2>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 flex-1 overflow-x-auto">
            <TaskColumn id="unassigned" title={t('apps.operations.unassignedTasks')} tasks={tasks.unassigned} />
            {routesData?.map(route => (
              <TaskColumn key={route.id} id={route.id} title={route.name} tasks={tasks[route.id] || []} />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};
export default OperationsApp;