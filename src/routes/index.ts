import { Router } from 'express';

// Import route modules (to be implemented later)
// import authRoutes from './auth.js';
// import workspaceRoutes from './workspaces.js';
// import linkRoutes from './links.js';
// import taskRoutes from './tasks.js';
// import monitoringRoutes from './monitoring.js';

const router = Router();

// API version
router.get('/', (req, res) => {
  res.json({
    name: 'BlinkDesk API',
    version: '1.0.0',
    description: 'Open-source self-hosted workspace and link organizer',
    endpoints: {
      auth: '/api/auth',
      workspaces: '/api/workspaces',
      links: '/api/links',
      tasks: '/api/tasks',
      monitoring: '/api/monitoring',
    },
    documentation: '/api/docs',
    health: '/health',
  });
});

// Route registration (uncomment when implementing controllers)
// router.use('/auth', authRoutes);
// router.use('/workspaces', workspaceRoutes);
// router.use('/links', linkRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/monitoring', monitoringRoutes);

export default router;
