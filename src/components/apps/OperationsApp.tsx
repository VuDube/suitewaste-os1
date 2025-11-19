import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { List, Truck } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Mock data
const mockRoutes = [
  { id: 'R001', area: 'Sandton', status: 'In Progress', progress: 65 },
  { id: 'R002', area: 'Midrand', status: 'Completed', progress: 100 },
  { id: 'R003', area: 'Soweto', status: 'Pending', progress: 0 },
];
const joburgCenter: L.LatLngExpression = [-26.2041, 28.0473];
const vehiclePositions: L.LatLngExpression[] = [
  [-26.1, 28.05],
  [-26.2, 28.0],
  [-26.15, 28.1],
];
const routeLine: L.LatLngExpression[] = [
  [-26.1, 28.05],
  [-26.12, 28.02],
  [-26.15, 28.06],
  [-26.18, 28.03],
];
// Fix for default marker icon issue with webpack
const truckIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
const OperationsApp: React.FC = () => {
  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-[3] bg-muted">
        <MapContainer center={joburgCenter} zoom={11} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {vehiclePositions.map((pos, idx) => (
            <Marker key={idx} position={pos} icon={truckIcon}>
              <Popup>
                Vehicle #{idx + 1} <br /> Status: Active
              </Popup>
            </Marker>
          ))}
          <Polyline pathOptions={{ color: '#2E7D32' }} positions={routeLine} />
        </MapContainer>
      </div>
      <div className="flex-[1] border-l">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List /> Daily Routes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRoutes.map((route) => (
                  <div key={route.id} className="p-3 rounded-md border">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{route.id} - {route.area}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        route.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        route.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{route.status}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${route.progress}%` }}></div>
                    </div>
                  </div>
                ))}
                <Button className="w-full">Optimize Routes</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck /> Live Vehicle Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Vehicle tracking is active. 3/3 vehicles online.</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
export default OperationsApp;