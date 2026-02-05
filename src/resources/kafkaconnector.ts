import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface ConnectorTask {
  id: number;
  state: 'RUNNING' | 'FAILED' | 'PAUSED' | 'UNASSIGNED';
  workerId?: string;
  trace?: string;
}

export interface ConnectorStatus {
  name?: string;
  connector?: {
    state: 'RUNNING' | 'FAILED' | 'PAUSED' | 'UNASSIGNED';
    workerId?: string;
  };
  tasks?: ConnectorTask[];
  type?: string;
}

export interface StrimziKafkaConnector extends KubeObjectInterface {
  spec: {
    class?: string;
    tasksMax?: number;
    config?: Record<string, any>;
    pause?: boolean;
    state?: 'stopped' | 'paused' | 'running';
    autoRestart?: {
      enabled?: boolean;
    };
  };
  status?: {
    conditions?: Condition[];
    observedGeneration?: number;
    connectorStatus?: ConnectorStatus;
    tasksMax?: number;
    topics?: string[];
    autoRestart?: {
      count?: number;
      connectorName?: string;
      lastRestartTimestamp?: string;
    };
  };
}

export class KafkaConnector extends KubeObject<StrimziKafkaConnector> {
  static kind = 'KafkaConnector';
  static apiName = 'kafkaconnectors';
  static apiVersion = 'kafka.strimzi.io/v1';
  static isNamespaced = true;

  // Check if the connector is ready
  get ready() {
    return (
      this.status?.conditions?.find(condition => condition.type === 'Ready')?.status === 'True'
    );
  }

  // Get connector class
  get connectorClass() {
    return this.spec?.class || 'N/A';
  }

  // Get max tasks
  get maxTasks() {
    return this.spec?.tasksMax || this.status?.tasksMax || 0;
  }

  // Get connector state from status
  get connectorState() {
    return this.status?.connectorStatus?.connector?.state || 'UNKNOWN';
  }

  // Get tasks
  get tasks() {
    return this.status?.connectorStatus?.tasks || [];
  }

  // Get running tasks count
  get runningTasksCount() {
    return this.tasks.filter(task => task.state === 'RUNNING').length;
  }

  // Get failed tasks count
  get failedTasksCount() {
    return this.tasks.filter(task => task.state === 'FAILED').length;
  }

  // Get paused tasks count
  get pausedTasksCount() {
    return this.tasks.filter(task => task.state === 'PAUSED').length;
  }

  // Get topics
  get topics() {
    return this.status?.topics || [];
  }

  // Get auto restart count
  get autoRestartCount() {
    return this.status?.autoRestart?.count || 0;
  }

  // Get the cluster name from labels
  get clusterName() {
    return this.jsonData.metadata?.labels?.['strimzi.io/cluster'] || 'N/A';
  }

  // Note: This workaround is needed to make the plugin compatible with older versions of Headlamp
  static get listRoute() {
    return '/strimzi/connectors';
  }

  static get detailsRoute() {
    return '/strimzi/connectors/:namespace/:name';
  }

  // Get status
  get status() {
    return this.jsonData.status;
  }

  // Get spec
  get spec() {
    return this.jsonData.spec;
  }
}
