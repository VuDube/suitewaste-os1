import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, LineChart, PieChart, Bar, Line, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowUp, Recycle, Truck, AlertTriangle, Bot } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-is-mobile';
const kpiData = [
  { title: 'apps.dashboard.collected', value: '1,280', change: '+12.5%', icon: Recycle },
  { title: 'apps.dashboard.routesCompleted', value: '312', change: '+5.2%', icon: Truck },
  { title: 'apps.dashboard.recyclingRate', value: '68%', change: '+2.1%', icon: ArrowUp },
];
const wasteCompositionData = [
  { name: 'Organics', value: 400 },
  { name: 'Paper', value: 300 },
  { name: 'Plastics', value: 300 },
  { name: 'Glass', value: 200 },
  { name: 'Other', value: 100 },
];
const collectionTrendData = [
  { name: 'Jan', tons: 400 },
  { name: 'Feb', tons: 300 },
  { name: 'Mar', tons: 500 },
  { name: 'Apr', tons: 450 },
  { name: 'May', tons: 600 },
  { name: 'Jun', tons: 580 },
];
const aiInsightsData = [
  { text: 'apps.dashboard.anomaly', icon: AlertTriangle, color: 'text-yellow-500' },
  { text: 'apps.dashboard.suggestion', icon: Bot, color: 'text-blue-500' },
];
const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#C8E6C9', '#A1887F'];
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};
const CustomTooltip = ({ active, payload, label }: any) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
        <p className="label font-semibold">{t(`charts.${label.toLowerCase()}`, { defaultValue: label })}</p>
        <p className="intro text-primary">{`${t(`charts.${payload[0].name.toLowerCase()}`)}: ${payload[0].value} ${t('charts.tons')}`}</p>
      </div>
    );
  }
  return null;
};
const DashboardApp: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const isMobile = useIsMobile();
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate data loading
    return () => clearTimeout(timer);
  }, []);
  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-8 space-y-8">
        <header>
          <h1 className="text-3xl font-bold">{t('apps.dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('apps.dashboard.description')}</p>
        </header>
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isLoading ? Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader><Skeleton className="h-5 w-3/4" style={{ animationDelay: `${i * 0.1}s` }} /></CardHeader>
              <CardContent><Skeleton className="h-8 w-1/2" style={{ animationDelay: `${i * 0.1}s` }} /><Skeleton className="h-4 w-1/3 mt-2" style={{ animationDelay: `${i * 0.1}s` }} /></CardContent>
            </Card>
          )) : kpiData.map((kpi, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t(kpi.title)}</CardTitle>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className="text-xs text-muted-foreground text-green-600">{kpi.change} from last month</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="grid gap-8 md:grid-cols-1 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('apps.dashboard.collectionTrend')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="w-full h-[300px] animate-pulse" /> : (
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                    <LineChart data={collectionTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="tons" name={t('charts.tonsCollected')} stroke="#2E7D32" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>{t('apps.dashboard.aiInsights')}</CardTitle>
                <p className="text-sm text-muted-foreground">{t('apps.dashboard.aiInsightsDesc')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-12 w-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />) :
                  aiInsightsData.map((insight, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <insight.icon className={`h-5 w-5 mt-1 flex-shrink-0 ${insight.color}`} />
                      <p className="text-sm">{t(insight.text)}</p>
                    </motion.div>
                  ))}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants} className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{t('apps.dashboard.composition')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="w-full h-[300px] animate-pulse" /> : (
                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                    <PieChart>
                      <Pie data={wasteCompositionData} cx="50%" cy="50%" labelLine={false} outerRadius={isMobile ? 80 : 100} fill="#8884d8" dataKey="value">
                        {wasteCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
};
export default DashboardApp;