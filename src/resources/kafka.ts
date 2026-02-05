import { KubeObject } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';
import { KubeObjectInterface } from '@kinvolk/headlamp-plugin/lib/k8s/cluster';

export interface Condition {
  type: string;
  status: string;
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface StrimziKafka extends KubeObjectInterface {
  spec: {
    kafka?: {
      version?: string;
      metadataVersion?: string;
      replicas?: number;
      listeners?: Array<{
        name: string;
        port: number;
        type: string;
        tls?: boolean;
      }>;
      config?: Record<string, any>;
    };
    entityOperator?: {
      topicOperator?: Record<string, any>;
      userOperator?: Record<string, any>;
    };
  };
  status?: {
    conditions?: Condition[];
    observedGeneration?: number;
  };
}

export class Kafka extends KubeObject<StrimziKafka> {
  static kind = 'Kafka';
  static apiName = 'kafkas';
  static apiVersion = 'kafka.strimzi.io/v1';
  static isNamespaced = true;

  // Check if the Kafka cluster is ready
  get ready() {
    return (
      this.status?.conditions?.find(condition => condition.type === 'Ready')?.status === 'True'
    );
  }

  // Get Kafka version from spec
  get version() {
    return this.spec?.kafka?.version || 'N/A';
  }

  // Note: This workaround is needed to make the plugin compatible with older versions of Headlamp
  static get listRoute() {
    return '/strimzi/kafka';
  }

  static get detailsRoute() {
    return '/strimzi/kafka/:namespace/:name';
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
