# Strimzi Headlamp Plugin - Test Resources Setup

This directory contains scripts to easily set up and tear down test resources for the Strimzi Headlamp plugin.

## Prerequisites

1. **Kubernetes cluster** (minikube, kind, or any Kubernetes cluster)
2. **Strimzi Operator** installed and running
   - See: https://strimzi.io/docs/operators/latest/deploying.html
   - The script will check if the operator is running, but won't install it

3. **kubectl** configured to access your cluster

## Quick Start

### Setup All Test Resources

Run the setup script to create all test resources:

```bash
./setup-test-resources.sh
```

This script will:
- Create the `kafka` namespace (if it doesn't exist)
- Create a Kafka cluster (`test-cluster`)
- Create a KafkaTopic (`test-topic`)
- Create a KafkaUser (`test-user`) with ACLs
- Create a KafkaConnect cluster (`my-connect-cluster`)
- Create a KafkaConnector (`my-connector`)

The script will wait for resources to become ready (with timeouts).

### Cleanup All Test Resources

To delete all test resources:

```bash
./cleanup-test-resources.sh
```

## What Gets Created

### 1. Kafka Cluster (`test-cluster`)
- Single broker cluster
- Plain and TLS listeners
- Entity Operator enabled (Topic Operator + User Operator)
- Ephemeral storage (for testing)

### 2. KafkaTopic (`test-topic`)
- 3 partitions
- 1 replica
- Retention and segment configuration

### 3. KafkaUser (`test-user`)
- SCRAM-SHA-512 authentication
- Simple authorization with ACLs:
  - Read/Describe on `test-topic`
  - Write/Create on `test-topic`
  - Read on consumer group `test-group`

### 4. KafkaConnect Cluster (`my-connect-cluster`)
- Single replica
- Connected to `test-cluster`
- Configured to use KafkaConnector resources

### 5. KafkaConnector (`my-connector`)
- FileStreamSourceConnector
- 2 tasks max
- Writes to `test-topic`

## Manual Setup

If you prefer to create resources manually, you can use the individual YAML files:

```bash
# Create namespace
kubectl create namespace kafka

# Create Kafka cluster (you'll need to create this based on your needs)
kubectl apply -f <your-kafka-cluster.yaml>

# Wait for Kafka to be ready
kubectl wait --for=condition=Ready kafka/test-cluster -n kafka --timeout=600s

# Create other resources
kubectl apply -f test-kafka-connect.yaml
kubectl apply -f test-kafka-connector.yaml
```

## Viewing Resources in Headlamp

Once resources are created, you can view them in Headlamp:

1. **Kafka Clusters**: Navigate to `Strimzi → Kafka Clusters`
   - Click on `test-cluster` to see broker pods, listeners, configuration

2. **Kafka Topics**: Navigate to `Strimzi → Kafka Topics`
   - Click on `test-topic` to see partitions, replicas, configuration

3. **Kafka Users**: Navigate to `Strimzi → Kafka Users`
   - Click on `test-user` to see authentication, ACLs, quotas

4. **Kafka Connect**: Navigate to `Strimzi → Kafka Connect`
   - Click on `my-connect-cluster` to see status, configuration, restart button

5. **Kafka Connectors**: Navigate to `Strimzi → Kafka Connectors`
   - Click on `my-connector` to see tasks, restart actions, configuration

## Troubleshooting

### Resources Not Appearing

1. **Check if Strimzi Operator is running:**
   ```bash
   kubectl get deployment -n <operator-namespace> strimzi-cluster-operator
   ```

2. **Check resource status:**
   ```bash
   kubectl get kafka,kafkatopic,kafkauser,kafkaconnect,kafkaconnector -n kafka
   ```

3. **Check for errors:**
   ```bash
   kubectl describe kafka test-cluster -n kafka
   kubectl logs -n <operator-namespace> -l name=strimzi-cluster-operator
   ```

### KafkaConnect Not Ready

If KafkaConnect shows "Not Ready" status:
- Check if the Kafka cluster is ready first
- Verify the bootstrap server address is correct
- Check operator logs for NetworkPolicy or other permission issues

### Connector Tasks Not Showing

If connector tasks show "0/2 (Not Started)":
- Ensure KafkaConnect cluster is Ready
- Wait a few minutes for the connector to start
- Check connector status: `kubectl describe kafkaconnector my-connector -n kafka`

## Customization

You can modify the script or YAML files to:
- Change resource names
- Adjust replica counts
- Modify configurations
- Add additional resources

## Notes

- The scripts use the `kafka` namespace by default
- Resources use ephemeral storage (data is lost on pod restart)
- The Kafka cluster is configured for single-node testing
- All resources are created in the same namespace for simplicity
