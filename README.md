# Deployment Instructions

## Setting up Secrets

Before deploying, you need to configure the necessary secrets in your repository's GitHub settings:

1. **GPG_PASS**: This secret stores your GPG password, required for signing commits or releases.
2. **DEPLOYMENTS_PAT**: This secret stores your Personal Access Token (PAT) that allows access to deploy and trigger actions.

### Steps:

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets** > **Actions**.
3. Add the following secrets:
   - **GPG_PASS**: Your GPG password for signing (if applicable).
   - **DEPLOYMENTS_PAT**: Your Personal Access Token (PAT) for deployment.

## Deployment

Once the secrets are set, you can deploy the application by running the following command:

```bash
initDeploy $repo_name
```
