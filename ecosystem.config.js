module.exports = {
  apps: [
    {
      name: "vendure-server",
      script: "npm",
      args: "run start:server",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development",
        args: "run dev:server",
        watch: ["src"],
        ignore_watch: ["node_modules", ".git", "dist", "*.log"]
      }
    },
    {
      name: "vendure-worker",
      script: "npm",
      args: "run start:worker",
      env_production: {
        NODE_ENV: "production"
      },
      env_development: {
        NODE_ENV: "development",
        args: "run dev:worker",
        watch: ["src"],
        ignore_watch: ["node_modules", ".git", "dist", "*.log"]
      }
    }
  ]
};
