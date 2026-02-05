import {
  DetailsGrid,
  NameValueTable,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Button, Chip, Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tooltip } from '@mui/material';
import { useParams } from 'react-router-dom';
import { KafkaConnector, ConnectorTask } from '../../resources/kafkaconnector';
import { TaskManagement } from './TaskManagement';

export function ConnectorDetail() {
  const { name, namespace } = useParams<{ name: string; namespace: string }>();

  return (
    <DetailsGrid
      resourceType={KafkaConnector}
      name={name}
      namespace={namespace}
      withEvents
      extraInfo={item =>
        item && [
          {
            name: 'Status',
            value: item.ready ? 'Ready' : 'Not Ready',
          },
          {
            name: 'Cluster',
            value: item.clusterName,
          },
          {
            name: 'Connector Class',
            value: item.connectorClass,
          },
          {
            name: 'State',
            value: (
              <Chip
                label={item.connectorState}
                color={
                  item.connectorState === 'RUNNING'
                    ? 'success'
                    : item.connectorState === 'FAILED'
                    ? 'error'
                    : item.connectorState === 'PAUSED'
                    ? 'warning'
                    : 'default'
                }
                size="small"
                variant="outlined"
              />
            ),
          },
          {
            name: 'Tasks',
            value: `${item.runningTasksCount}/${item.maxTasks} Running`,
          },
          {
            name: 'Failed Tasks',
            value: item.failedTasksCount > 0 ? (
              <Chip label={item.failedTasksCount.toString()} color="error" size="small" />
            ) : (
              '0'
            ),
          },
        ]
      }
      extraSections={item =>
        item && [
          {
            id: 'TaskManagement',
            section: <TaskManagement connector={item} />,
          },
          {
            id: 'Topics',
            section: item.topics && item.topics.length > 0 && (
              <SectionBox title="Topics Used">
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {item.topics.map((topic, index) => (
                    <Chip key={index} label={topic} size="small" variant="outlined" />
                  ))}
                </Box>
              </SectionBox>
            ),
          },
          {
            id: 'Configuration',
            section: item.spec?.config && Object.keys(item.spec.config).length > 0 && (
              <SectionBox title="Connector Configuration">
                <NameValueTable
                  rows={Object.entries(item.spec.config).map(([key, value]) => ({
                    name: key,
                    value: String(value),
                  }))}
                />
              </SectionBox>
            ),
          },
          {
            id: 'AutoRestart',
            section: item.status?.autoRestart && (
              <SectionBox title="Auto Restart Status">
                <NameValueTable
                  rows={[
                    {
                      name: 'Restart Count',
                      value: item.autoRestartCount.toString(),
                    },
                    ...(item.status.autoRestart.lastRestartTimestamp
                      ? [
                          {
                            name: 'Last Restart',
                            value: item.status.autoRestart.lastRestartTimestamp,
                          },
                        ]
                      : []),
                  ]}
                />
              </SectionBox>
            ),
          },
          {
            id: 'Status',
            section: item.status && (
              <SectionBox title="Status">
                {item.status.conditions && item.status.conditions.length > 0 ? (
                  <NameValueTable
                    rows={item.status.conditions.map(condition => ({
                      name: condition.type,
                      value: (
                        <div>
                          <div>Status: {condition.status}</div>
                          {condition.reason && <div>Reason: {condition.reason}</div>}
                          {condition.message && <div>Message: {condition.message}</div>}
                          {condition.lastTransitionTime && (
                            <div>Last Transition: {condition.lastTransitionTime}</div>
                          )}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <div>No status conditions available</div>
                )}
              </SectionBox>
            ),
          },
        ]
      }
    />
  );
}
