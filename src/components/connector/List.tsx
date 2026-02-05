import { ResourceListView } from '@kinvolk/headlamp-plugin/lib/CommonComponents';
import { KafkaConnector } from '../../resources/kafkaconnector';

export function ConnectorList() {
  return (
    <ResourceListView
      title="Kafka Connectors"
      resourceClass={KafkaConnector}
      columns={[
        'name',
        'namespace',
        {
          id: 'cluster',
          label: 'Cluster',
          getValue: item => item.clusterName,
        },
        {
          id: 'class',
          label: 'Connector Class',
          getValue: item => item.connectorClass,
        },
        {
          id: 'state',
          label: 'State',
          getValue: item => item.connectorState,
        },
        {
          id: 'tasks',
          label: 'Tasks',
          getValue: item => {
            const maxTasks = item.maxTasks || 0;
            const runningTasks = item.runningTasksCount || 0;
            const totalTasks = item.tasks?.length || 0;
            // If we have tasks, show running/total, otherwise show 0/max
            if (totalTasks > 0) {
              return `${runningTasks}/${totalTasks} Running`;
            }
            return maxTasks > 0 ? `0/${maxTasks} (Not Started)` : 'N/A';
          },
        },
        {
          id: 'status',
          label: 'Status',
          getValue: item => {
            if (item.failedTasksCount > 0) return 'Failed';
            if (item.ready) return 'Ready';
            return 'Not Ready';
          },
        },
        'age',
      ]}
    />
  );
}
