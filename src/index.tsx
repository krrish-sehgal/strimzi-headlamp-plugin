import { registerRoute, registerSidebarEntry } from '@kinvolk/headlamp-plugin/lib';
import { KafkaDetail } from './components/kafka/Detail';
import { KafkaList } from './components/kafka/List';
import { TopicDetail } from './components/topic/Detail';
import { TopicList } from './components/topic/List';
import { UserDetail } from './components/user/Detail';
import { UserList } from './components/user/List';
import { ConnectDetail } from './components/connect/Detail';
import { ConnectList } from './components/connect/List';
import { ConnectorDetail } from './components/connector/Detail';
import { ConnectorList } from './components/connector/List';

// Register the main Strimzi sidebar entry
registerSidebarEntry({
  name: 'Strimzi',
  url: '/strimzi/kafka',
  icon: 'mdi:database',
  parent: '',
  label: 'Strimzi',
});

// Register Kafka Clusters sidebar entry
registerSidebarEntry({
  name: 'Kafka Clusters',
  url: '/strimzi/kafka',
  parent: 'Strimzi',
  label: 'Kafka Clusters',
});

// Register the Kafka list route
// IMPORTANT: exact: true prevents this route from matching detail URLs like /strimzi/kafka/:namespace/:name
registerRoute({
  path: '/strimzi/kafka',
  sidebar: 'Kafka Clusters',
  name: 'Kafka Clusters',
  component: () => <KafkaList />,
  exact: true,  // Only match exactly /strimzi/kafka, not /strimzi/kafka/...
});

// Register the Kafka detail route
// Use "Kafka" as the route name so Link component can find it by kind
registerRoute({
  path: '/strimzi/kafka/:namespace/:name',
  sidebar: 'Kafka Clusters',
  name: 'Kafka',
  component: () => <KafkaDetail />,
});

// Register Kafka Topics sidebar entry
registerSidebarEntry({
  name: 'Kafka Topics',
  url: '/strimzi/topics',
  parent: 'Strimzi',
  label: 'Kafka Topics',
});

// Register the Kafka Topic list route
registerRoute({
  path: '/strimzi/topics',
  sidebar: 'Kafka Topics',
  name: 'Kafka Topics',
  component: () => <TopicList />,
  exact: true,
});

// Register the Kafka Topic detail route
registerRoute({
  path: '/strimzi/topics/:namespace/:name',
  sidebar: 'Kafka Topics',
  name: 'KafkaTopic',
  component: () => <TopicDetail />,
});

// Register Kafka Users sidebar entry
registerSidebarEntry({
  name: 'Kafka Users',
  url: '/strimzi/users',
  parent: 'Strimzi',
  label: 'Kafka Users',
});

// Register the Kafka User list route
registerRoute({
  path: '/strimzi/users',
  sidebar: 'Kafka Users',
  name: 'Kafka Users',
  component: () => <UserList />,
  exact: true,
});

// Register the Kafka User detail route
registerRoute({
  path: '/strimzi/users/:namespace/:name',
  sidebar: 'Kafka Users',
  name: 'KafkaUser',
  component: () => <UserDetail />,
});

// Register Kafka Connect sidebar entry
registerSidebarEntry({
  name: 'Kafka Connect',
  url: '/strimzi/connect',
  parent: 'Strimzi',
  label: 'Kafka Connect',
});

// Register the Kafka Connect list route
registerRoute({
  path: '/strimzi/connect',
  sidebar: 'Kafka Connect',
  name: 'Kafka Connect',
  component: () => <ConnectList />,
  exact: true,
});

// Register the Kafka Connect detail route
registerRoute({
  path: '/strimzi/connect/:namespace/:name',
  sidebar: 'Kafka Connect',
  name: 'KafkaConnect',
  component: () => <ConnectDetail />,
});

// Register Kafka Connectors sidebar entry
registerSidebarEntry({
  name: 'Kafka Connectors',
  url: '/strimzi/connectors',
  parent: 'Strimzi',
  label: 'Kafka Connectors',
});

// Register the Kafka Connector list route
registerRoute({
  path: '/strimzi/connectors',
  sidebar: 'Kafka Connectors',
  name: 'Kafka Connectors',
  component: () => <ConnectorList />,
  exact: true,
});

// Register the Kafka Connector detail route
registerRoute({
  path: '/strimzi/connectors/:namespace/:name',
  sidebar: 'Kafka Connectors',
  name: 'KafkaConnector',
  component: () => <ConnectorDetail />,
});
