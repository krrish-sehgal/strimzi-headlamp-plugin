# Strimzi Headlamp Plugin

<div align="center">

![Strimzi](https://img.shields.io/badge/Strimzi-Kafka%20Operator-blue)
![Headlamp](https://img.shields.io/badge/Headlamp-Kubernetes%20UI-green)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)
![Version](https://img.shields.io/badge/version-0.1.0-orange)

**A comprehensive Kubernetes Dashboard Plugin for Apache Kafka Management with Strimzi**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation)

</div>

---

## 📖 Overview

The **Strimzi Headlamp Plugin** provides a unified, visual interface for managing Apache Kafka infrastructure on Kubernetes through the Strimzi Operator. This plugin eliminates the need for separate tooling or CLI operations, bringing Kafka cluster management directly into the Headlamp Kubernetes dashboard.

### 🎯 Problem Statement

Currently, Strimzi users must rely on `kubectl` commands and YAML manifests to manage their Kafka infrastructure. While tools like Cruise Control UI exist for cluster rebalancing, there is no unified interface for day-to-day Kafka operations on Kubernetes. This creates several challenges:

- **Operational complexity**: Managing topics, users, and connectors requires deep knowledge of Strimzi CRDs and kubectl commands
- **Limited visibility**: Understanding cluster health, consumer lag, and connector status requires multiple CLI commands or external tools
- **Context switching**: Platform teams must jump between Kubernetes dashboards and Kafka-specific tools
- **Steep learning curve**: New users struggle to understand the relationship between Strimzi resources and their Kafka clusters

### ✨ Solution

This plugin provides a comprehensive, user-friendly interface within Headlamp that enables:

- **Visual management** of all Strimzi resources (Kafka clusters, topics, users, connectors)
- **Real-time monitoring** of cluster health, broker status, and task states
- **One-click operations** for common tasks like restarting connectors and managing ACLs
- **Integrated workflow** that keeps everything in the Kubernetes dashboard context

---

## 🎬 Demo

### Video Demo

> **📹 [Watch the Full Demo Video](YOUR_VIDEO_LINK_HERE)** *(Coming soon - you can add your video link here)*

The demo showcases:
- Setting up and viewing Kafka clusters
- Managing topics with create/delete operations
- Configuring users with ACL visualization
- Monitoring Kafka Connect clusters and connectors
- Task management and restart operations

### Screenshots

#### Kafka Cluster Overview
![Kafka Cluster Overview](docs/screenshots/kafka-cluster-overview.png)
*Comprehensive view of Kafka cluster with broker health, listeners, and configuration*

#### Topic Management
![Topic Management](docs/screenshots/topic-management.png)
*List and detail views for Kafka topics with partition and replica information*

#### User Management with ACL Visualization
![User Management](docs/screenshots/user-management.png)
*Kafka user management with color-coded ACL rules and authentication details*

#### Kafka Connect & Connector Management
![Connect Management](docs/screenshots/connect-management.png)
*Kafka Connect cluster status and connector task management with restart capabilities*

#### Task Management
![Task Management](docs/screenshots/task-management.png)
*Detailed task view showing running, failed, and paused tasks with restart actions*

> **Note**: Screenshots are placeholders. Replace with actual screenshots from your Headlamp instance.

---

## 🚀 Features

### ✅ Kafka Cluster Overview
- **Broker health status** with real-time pod monitoring
- **Listener endpoints** (plain, TLS, external) with configuration details
- **Kafka version** and metadata version tracking
- **Cluster conditions** with detailed status information
- **Readiness state** indicators

### ✅ Topic Management
- **List all topics** across namespaces with filtering
- **Create topics** with partition and replica configuration
- **Delete topics** with confirmation dialogs
- **View topic details**: partitions, replicas, configuration
- **Ready status** monitoring

### ✅ User Management
- **View all users** with authentication and authorization types
- **Authentication details**: TLS, TLS-External, SCRAM-SHA-512
- **ACL visualization** with color-coded rules:
  - Resource types (Topic, Group, Cluster, TransactionalID)
  - Operations (Read, Write, Create, Delete, etc.)
  - Pattern types (Literal, Prefix)
- **Quota configurations** display
- **Status monitoring**

### ✅ Kafka Connect Management
- **Connect cluster status** with replica and version information
- **Cluster restart** functionality via rolling updates
- **Configuration display** for Connect clusters
- **URL endpoints** for REST API access

### ✅ Connector Management
- **Connector list** with state and task information
- **Task states**: Running, Failed, Paused, Unassigned
- **Task management table** with detailed information:
  - Task ID, State, Worker ID
  - Error traces for failed tasks
  - Status summary chips
- **Restart actions**:
  - Restart entire connector
  - Restart individual tasks
- **Auto-restart tracking** with count and timestamps
- **Topics used** by connectors

---

## 📦 Installation

### Prerequisites

- Kubernetes cluster (minikube, kind, or any Kubernetes cluster)
- [Strimzi Operator](https://strimzi.io/docs/operators/latest/deploying.html) installed
- [Headlamp](https://headlamp.dev/docs/latest/installation/) installed and running

### Install the Plugin

1. **Clone the repository:**
   ```bash
   git clone https://github.com/krrish-sehgal/strimzi-headlamp-plugin.git
   cd strimzi-headlamp-plugin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the plugin:**
   ```bash
   npm run build
   ```

4. **Load in Headlamp:**
   
   **For Headlamp Desktop:**
   - Copy the `dist/main.js` file to Headlamp's plugins directory
   - Or use Headlamp's plugin loading mechanism
   
   **For Headlamp Web:**
   - Configure Headlamp to load plugins from your build directory
   - See [Headlamp Plugin Documentation](https://headlamp.dev/docs/latest/development/plugins/) for details

### Development Setup

```bash
# Start development server with hot reload
npm start

# Run linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## 🎮 Usage

### Quick Start

1. **Set up test resources:**
   ```bash
   ./setup-test-resources.sh
   ```
   This creates:
   - A Kafka cluster (`test-cluster`)
   - A test topic (`test-topic`)
   - A test user (`test-user`) with ACLs
   - A Kafka Connect cluster (`my-connect-cluster`)
   - A Kafka connector (`my-connector`)

2. **Access in Headlamp:**
   - Navigate to the **Strimzi** section in the sidebar
   - Explore:
     - **Kafka Clusters** → View and manage Kafka clusters
     - **Kafka Topics** → Create, view, and delete topics
     - **Kafka Users** → Manage users and visualize ACLs
     - **Kafka Connect** → Monitor Connect clusters
     - **Kafka Connectors** → Manage connectors and tasks

### Managing Kafka Clusters

1. Navigate to **Strimzi → Kafka Clusters**
2. Click on a cluster to view:
   - Broker pod status and health
   - Listener endpoints
   - Configuration
   - Status conditions

### Managing Topics

1. Navigate to **Strimzi → Kafka Topics**
2. Click **Create** to add a new topic
3. Configure partitions, replicas, and settings
4. View topic details and configuration
5. Delete topics using the row actions menu

### Managing Users

1. Navigate to **Strimzi → Kafka Users**
2. View user authentication types and ACL counts
3. Click on a user to:
   - See detailed authentication configuration
   - Visualize ACL rules in a color-coded table
   - View quota settings
   - Check status and conditions

### Managing Connectors

1. Navigate to **Strimzi → Kafka Connectors**
2. View connector states and task counts
3. Click on a connector to:
   - See task details and states
   - Restart the connector or individual tasks
   - View configuration and topics used
   - Monitor auto-restart status

### Restart Operations

- **Restart Connector**: Click the "Restart Connector" button in the connector detail view
- **Restart Task**: Click the restart icon next to a task in the task table
- **Restart Connect Cluster**: Click "Restart Cluster" in the Connect detail view

---

## 📚 Documentation

### Architecture

The plugin is built using:
- **React** with TypeScript
- **Headlamp Plugin SDK** for Kubernetes integration
- **Material-UI** for components
- **Strimzi CRDs** for resource management

### Resource Classes

- `Kafka` - Kafka cluster resource
- `KafkaTopic` - Topic resource
- `KafkaUser` - User resource
- `KafkaConnect` - Connect cluster resource
- `KafkaConnector` - Connector resource

### Components

- **List Views**: Display resources in tables with filtering and sorting
- **Detail Views**: Comprehensive resource information with sections
- **Task Management**: Interactive task table with restart capabilities
- **ACL Visualization**: Color-coded ACL rule display
- **Broker Pods Section**: Real-time broker pod monitoring

### API Integration

The plugin uses Headlamp's Kubernetes API client to:
- List and get resources
- Create, update, and delete resources
- Patch resources for restart operations
- Monitor resource status and conditions

---

## 🛠️ Development

### Project Structure

```
strimzi-headlamp-plugin/
├── src/
│   ├── components/
│   │   ├── kafka/          # Kafka cluster components
│   │   ├── topic/          # Topic management components
│   │   ├── user/           # User management components
│   │   ├── connect/        # Connect cluster components
│   │   └── connector/      # Connector management components
│   ├── resources/          # Resource class definitions
│   └── index.tsx           # Plugin entry point
├── dist/                   # Built plugin files
├── setup-test-resources.sh # Test resource setup script
├── cleanup-test-resources.sh # Test resource cleanup script
└── package.json
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Testing

```bash
# Run tests
npm test

# Set up test environment
./setup-test-resources.sh

# Clean up test resources
./cleanup-test-resources.sh
```

---

## 📋 Requirements Checklist

### ✅ Implemented Features

- [x] Kafka Cluster Overview with broker health status
- [x] Listener endpoints display
- [x] Kafka version and metadata version tracking
- [x] Cluster conditions monitoring
- [x] Topic list, create, delete operations
- [x] Topic configuration display
- [x] User list with authentication types
- [x] ACL visualization with color coding
- [x] Quota configuration display
- [x] Connect cluster status monitoring
- [x] Connector list with task information
- [x] Task state management (Running, Failed, Paused)
- [x] Restart actions for connectors and tasks
- [x] Connect cluster restart functionality

---

## 🤝 Acknowledgments

- [Strimzi](https://strimzi.io/) - Kubernetes Operator for Apache Kafka
- [Headlamp](https://headlamp.dev/) - Kubernetes Web UI
- [Apache Kafka](https://kafka.apache.org/) - Distributed event streaming platform

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Krrish Sehgal**
- GitHub: [@krrish-sehgal](https://github.com/krrish-sehgal)
- Project: LFX Mentorship Program

---

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ for the Kubernetes and Kafka communities**

[Report Bug](https://github.com/krrish-sehgal/strimzi-headlamp-plugin/issues) • [Request Feature](https://github.com/krrish-sehgal/strimzi-headlamp-plugin/issues) • [Documentation](https://github.com/krrish-sehgal/strimzi-headlamp-plugin/wiki)

</div>
