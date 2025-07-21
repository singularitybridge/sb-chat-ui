# SB Chat UI Deployment

The SB Chat UI can be deployed using either Kubernetes manifests or Helm charts. Both options are available in the `deploy` directory.

## Kubernetes Deployment

The Kubernetes manifests are located in `deploy/kubernetes/`:

- `deployment.yaml`: Contains the deployment configuration
- `service.yaml`: Contains the service configuration

To deploy using Kubernetes manifests:

```bash
kubectl apply -f deploy/kubernetes/deployment.yaml
kubectl apply -f deploy/kubernetes/service.yaml
```

## Helm Chart Deployment

A Helm chart is available in `deploy/helm/sb-chat-ui/`. The chart includes:

- Configurable number of replicas
- Resource limits and requests
- Environment variables
- Health check probes
- Service configuration (ClusterIP)
- Optional Ingress configuration

### Service Configuration

The application uses ClusterIP service type by default, which means it's only accessible within the cluster. To expose the service externally, you can:

1. Use Ingress (recommended for production)
2. Change the service type to LoadBalancer or NodePort (not recommended for production)

### Ingress Configuration

The chart includes optional Ingress configuration that can be enabled for external access. By default, it's disabled. To enable and configure Ingress:

```bash
helm install sb-chat-ui ./deploy/helm/sb-chat-ui \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=your-domain.com \
  --set ingress.tls[0].hosts[0]=your-domain.com
```

The Ingress configuration supports:
- TLS termination
- Custom annotations
- Multiple hosts
- Path-based routing

Example Ingress configuration:
```yaml
ingress:
  enabled: true
  className: "nginx"
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: your-domain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: sb-chat-ui-tls
      hosts:
        - your-domain.com
```

### API Service Integration

The UI service is configured to communicate with the SB Agent Portal API service through a configurable API URL. The connection is established through the `REACT_APP_API_URL` environment variable, which can be configured in several ways:

1. Using the default internal Kubernetes DNS (recommended for same-cluster deployment):
```bash
helm install sb-chat-ui ./deploy/helm/sb-chat-ui
```

2. Using a custom API URL:
```bash
helm install sb-chat-ui ./deploy/helm/sb-chat-ui \
  --set config.api.url="https://api.your-domain.com"
```

3. Using an external API service:
```bash
helm install sb-chat-ui ./deploy/helm/sb-chat-ui \
  --set config.api.url="https://api.external-service.com"
```

To deploy both services together in the same cluster:

1. Deploy the API service first:
```bash
helm install sb-agent-portal ./deploy/helm/sb-agent-portal
```

2. Deploy the UI service:
```bash
helm install sb-chat-ui ./deploy/helm/sb-chat-ui
```

The UI service will automatically connect to the API service using the internal Kubernetes DNS name.

### Configuration

The Helm chart can be configured through the `values.yaml` file or using the `--set` flag. Available configurations include:

- `replicaCount`: Number of pod replicas
- `image.repository`: Container image repository
- `image.tag`: Container image tag
- `service.type`: Kubernetes service type (default: ClusterIP)
- `ingress`: Ingress configuration
  - `enabled`: Enable/disable Ingress
  - `className`: Ingress class name
  - `annotations`: Ingress annotations
  - `hosts`: Ingress host configurations
  - `tls`: TLS configuration
- `resources`: CPU and memory resource limits
- `config`: Application configuration
  - `api.url`: URL of the API service
- `env`: Environment variables
- `probes`: Health check probe configurations

For more details, refer to the `values.yaml` file in the Helm chart directory.
