import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { useState } from 'react';
import { KafkaConnect } from '../../resources/kafkaconnect';
import { clusterRequest } from '@kinvolk/headlamp-plugin/lib/k8s/api/v1/clusterRequests';
import { useCluster } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

interface ConnectRestartButtonProps {
  connect: KafkaConnect | null;
}

export function ConnectRestartButton({ connect }: ConnectRestartButtonProps) {
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const cluster = useCluster();

  if (!connect) {
    return null;
  }

  const handleRestart = async () => {
    if (!connect) return;

    setRestarting(true);
    try {
      const namespace = connect.getNamespace();
      const connectName = connect.getName();
      // StrimziPodSet name for KafkaConnect is <cluster-name>-connect
      const podSetName = `${connectName}-connect`;

      // Get the StrimziPodSet using clusterRequest
      // Try v1beta2 first, fall back to v1 if needed
      let url = `/apis/core.strimzi.io/v1beta2/namespaces/${namespace}/strimzipodsets/${podSetName}`;
      let response = await clusterRequest(url, { cluster }).catch(() => null);
      
      // If v1beta2 fails, try v1
      if (!response || !response.ok) {
        url = `/apis/core.strimzi.io/v1/namespaces/${namespace}/strimzipodsets/${podSetName}`;
        response = await clusterRequest(url, { cluster });
      }
      
      const podSet = await response.json();

      if (!podSet) {
        alert(`StrimziPodSet "${podSetName}" not found. The cluster may not be fully deployed yet.`);
        setRestartDialogOpen(false);
        setRestarting(false);
        return;
      }

      // Patch the StrimziPodSet to add rolling update annotation
      await clusterRequest(url, {
        cluster,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
        },
        body: JSON.stringify({
          metadata: {
            annotations: {
              ...podSet.metadata.annotations,
              'strimzi.io/manual-rolling-update': 'true',
            },
          },
        }),
      });

      setRestartDialogOpen(false);
      // Refresh the page or trigger a refetch
      window.location.reload();
    } catch (error) {
      console.error('Failed to restart KafkaConnect cluster:', error);
      alert('Failed to restart KafkaConnect cluster. Please try again.');
    } finally {
      setRestarting(false);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => setRestartDialogOpen(true)}
        disabled={restarting}
      >
        Restart Cluster
      </Button>

      <Dialog open={restartDialogOpen} onClose={() => setRestartDialogOpen(false)}>
        <DialogTitle>Restart Kafka Connect Cluster</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restart the Kafka Connect cluster &quot;{connect.getName()}&quot;?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This will trigger a rolling update of all pods in the cluster. The cluster will remain
            available during the update, but there may be brief interruptions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestartDialogOpen(false)} disabled={restarting}>
            Cancel
          </Button>
          <Button
            onClick={handleRestart}
            color="primary"
            variant="contained"
            disabled={restarting}
          >
            {restarting ? 'Restarting...' : 'Restart'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
