import { type FC } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, MoreHorizontal, Play, Pause, 
  Clock, CheckCircle, AlertCircle, TrendingUp,
  Zap, Users, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Header } from '@/components/landing/Header';

// Mock data for demo
const mockWorkflows = [
  {
    id: '1',
    name: 'Email Welcome Sequence',
    description: 'Send personalized welcome emails to new users',
    status: 'active',
    lastRun: '2 hours ago',
    runs: 1247,
    successRate: 99.2,
  },
  {
    id: '2',
    name: 'Slack Notifications',
    description: 'Post updates to Slack when tickets are updated',
    status: 'active',
    lastRun: '5 minutes ago',
    runs: 8934,
    successRate: 98.7,
  },
  {
    id: '3',
    name: 'Data Sync Pipeline',
    description: 'Sync customer data between CRM and database',
    status: 'paused',
    lastRun: '1 day ago',
    runs: 456,
    successRate: 97.1,
  },
  {
    id: '4',
    name: 'AI Content Generator',
    description: 'Generate blog posts using AI and publish to CMS',
    status: 'error',
    lastRun: '3 hours ago',
    runs: 89,
    successRate: 85.3,
  },
];

const stats = [
  { label: 'Total Workflows', value: '12', icon: Zap, change: '+2 this week' },
  { label: 'Total Runs', value: '10.7K', icon: Activity, change: '+1.2K today' },
  { label: 'Success Rate', value: '98.1%', icon: CheckCircle, change: '+0.3%' },
  { label: 'Active Users', value: '3', icon: Users, change: 'You + 2' },
];

const Dashboard: FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your workflows
            </p>
          </div>
          <Link to="/workflow/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Workflow
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-primary/10">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Workflows Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Workflows</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  className="pl-9 w-64 bg-card/50"
                />
              </div>
            </div>
          </div>

          {/* Workflow Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockWorkflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Link to={`/workflow/${workflow.id}`}>
                  <Card className="glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {workflow.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {workflow.description}
                          </CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={workflow.status} />
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {workflow.lastRun}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            {workflow.runs.toLocaleString()} runs
                          </span>
                          <span className={cn(
                            workflow.successRate >= 95 ? 'text-emerald-500' : 
                            workflow.successRate >= 85 ? 'text-amber-500' : 'text-destructive'
                          )}>
                            {workflow.successRate}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State (shown when no workflows) */}
        {mockWorkflows.length === 0 && (
          <Card className="glass-card border-dashed border-2 border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No workflows yet</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Create your first workflow to start automating tasks. Use our visual builder
                or let AI help you create one from a description.
              </p>
              <Link to="/workflow/new">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first workflow
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    active: { label: 'Active', icon: Play, className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    paused: { label: 'Paused', icon: Pause, className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    error: { label: 'Error', icon: AlertCircle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  }[status] || { label: status, icon: Clock, className: 'bg-muted text-muted-foreground' };

  return (
    <Badge variant="outline" className={cn('gap-1 font-normal', config.className)}>
      <config.icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
};

export default Dashboard;
