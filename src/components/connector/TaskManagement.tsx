import { SectionBox } from '@kinvolk/headlamp-plugin/lib/components/common';
import { Button, Chip, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { KafkaConnector } from '../../resources/kafkaconnector';

interface TaskManagementProps {
  connector: KafkaConnector | null;
}

function getTaskStateColor(state: string): 'success' | 'error' | 'warning' | 'default' {
  switch (state) {
    case 'RUNNING':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'PAUSED':
      return 'warning';
    default:
      return 'default';
  }
}

export function TaskManagement({ connector }: TaskManagementProps) {
  const [restartDialogOpen, setRestartDialogOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);

  if (!connector) {
    return null;
  }

  const tasks = connector.tasks || [];
  const failedTasks = tasks.filter(task => task.state === 'FAILED');

  const handleRestartConnector = async () => {
    if (!connector) return;

    setRestarting(true);
    try {
      // Use KubeObject's patch method to add restart annotation
      const patch = (connector.constructor as any).apiEndpoint.patch;
      await patch(
        {
          metadata: {
            annotations: {
              ...connector.jsonData.metadata.annotations,
              'strimzi.io/restart': 'true',
            },
          },
        },
        connector.getNamespace(),
        connector.getName()
      );

      setRestartDialogOpen(false);
      // Refresh the page or trigger a refetch
      window.location.reload();
    } catch (error) {
      console.error('Failed to restart connector:', error);
      alert('Failed to restart connector. Please try again.');
    } finally {
      setRestarting(false);
    }
  };

  const handleRestartTask = async (taskId: number) => {
    if (!connector) return;

    setRestarting(true);
    try {
      // Use KubeObject's patch method to add restart-task annotation
      const patch = (connector.constructor as any).apiEndpoint.patch;
      await patch(
        {
          metadata: {
            annotations: {
              ...connector.jsonData.metadata.annotations,
              'strimzi.io/restart-task': taskId.toString(),
            },
          },
        },
        connector.getNamespace(),
        connector.getName()
      );

      // Refresh the page or trigger a refetch
      window.location.reload();
    } catch (error) {
      console.error('Failed to restart task:', error);
      alert(`Failed to restart task ${taskId}. Please try again.`);
    } finally {
      setRestarting(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <SectionBox title="Task Management">
        <Typography color="text.secondary">No tasks available</Typography>
      </SectionBox>
    );
  }

  return (
    <>
      <SectionBox
        title="Task Management"
        headerProps={{
          titleSideActions: [
            <Button
              key="restart-connector"
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => setRestartDialogOpen(true)}
              disabled={restarting}
            >
              Restart Connector
            </Button>,
          ],
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Task Summary
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`Running: ${connector.runningTasksCount}`}
              color="success"
              size="small"
              variant="outlined"
            />
            {connector.failedTasksCount > 0 && (
              <Chip
                label={`Failed: ${connector.failedTasksCount}`}
                color="error"
                size="small"
                variant="outlined"
              />
            )}
            {connector.pausedTasksCount > 0 && (
              <Chip
                label={`Paused: ${connector.pausedTasksCount}`}
                color="warning"
                size="small"
                variant="outlined"
              />
            )}
            <Chip
              label={`Total: ${tasks.length}/${connector.maxTasks}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Task ID</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Worker ID</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task, index) => (
                <TableRow key={index}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={task.state}
                      color={getTaskStateColor(task.state)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {task.workerId || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`Restart task ${task.id}`}>
                      <IconButton
                        size="small"
                        onClick={() => handleRestartTask(task.id)}
                        disabled={restarting}
                        color={task.state === 'FAILED' ? 'error' : 'primary'}
                      >
                        <Icon icon="mdi:restart" />
                      </IconButton>
                    </Tooltip>
                    {task.trace && (
                      <Tooltip title={task.trace}>
                        <IconButton size="small" color="error">
                          <Icon icon="mdi:alert-circle" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {failedTasks.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Failed Tasks Details
            </Typography>
            {failedTasks.map((task, index) => (
              <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  Task {task.id}
                </Typography>
                {task.trace && (
                  <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {task.trace}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </SectionBox>

      <Dialog open={restartDialogOpen} onClose={() => setRestartDialogOpen(false)}>
        <DialogTitle>Restart Connector</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to restart the connector &quot;{connector.getName()}&quot;?
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            This will restart the connector instance. Tasks will be restarted if they are in a failed state.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestartDialogOpen(false)} disabled={restarting}>
            Cancel
          </Button>
          <Button
            onClick={handleRestartConnector}
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
