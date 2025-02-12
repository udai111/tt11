import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  symbol: string;
  condition: string;
  value: number;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
}

const AlertsManager = () => {
  const { toast } = useToast();
  const [newAlert, setNewAlert] = useState(false);

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      return response.json();
    }
  });

  const toggleAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/toggle`, {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Alert Updated',
        description: 'Alert status has been successfully updated.',
        variant: 'default'
      });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: 'DELETE'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Alert Deleted',
        description: 'Alert has been successfully deleted.',
        variant: 'default'
      });
    }
  });

  return (
    <div className="p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-primary">Alerts Manager</h1>
            <p className="text-muted-foreground">
              Manage your trading alerts and notifications
            </p>
          </div>
          <Button
            onClick={() => setNewAlert(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </Button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {isLoading ? (
          <p>Loading alerts...</p>
        ) : (
          alerts?.map((alert) => (
            <Card key={alert.id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Bell className={`w-5 h-5 ${alert.active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <h3 className="font-semibold">{alert.symbol}</h3>
                    <p className="text-sm text-muted-foreground">
                      {alert.condition} {alert.value}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.lastTriggered && (
                    <span className="text-sm text-muted-foreground">
                      Last triggered: {new Date(alert.lastTriggered).toLocaleString()}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlertMutation.mutate(alert.id)}
                  >
                    {alert.active ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Edit alert */}}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAlertMutation.mutate(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}

        {alerts?.length === 0 && (
          <Card className="p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Alerts Set</h3>
            <p className="text-muted-foreground mb-4">
              Create your first alert to start monitoring the market.
            </p>
            <Button
              onClick={() => setNewAlert(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </Button>
          </Card>
        )}
      </div>

      {/* Add Alert Dialog Component Here */}
    </div>
  );
};

export default AlertsManager;
