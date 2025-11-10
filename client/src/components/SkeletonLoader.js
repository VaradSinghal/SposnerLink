import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

export const EventCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Skeleton variant="circular" width={18} height={18} />
        <Skeleton variant="text" width={120} height={20} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Skeleton variant="circular" width={18} height={18} />
        <Skeleton variant="text" width={100} height={20} />
      </Box>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
    </CardContent>
  </Card>
);

export const StatsCardSkeleton = () => (
  <Card sx={{ height: '100%', borderRadius: 3 }}>
    <CardContent>
      <Skeleton variant="text" width="60%" height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={48} />
    </CardContent>
  </Card>
);

export const FormSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2, borderRadius: 2 }} />
  </Box>
);

export const MatchCardSkeleton = () => (
  <Card sx={{ p: 3, mb: 2, borderRadius: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      <Skeleton variant="text" width="30%" height={28} />
      <Skeleton variant="rectangular" width={60} height={28} sx={{ borderRadius: 1 }} />
    </Box>
    <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
    </Box>
  </Card>
);

export const EventsGridSkeleton = ({ count = 6 }) => (
  <Grid container spacing={3}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={12} md={6} lg={4} key={index}>
        <EventCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export const StatsGridSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 4 }).map((_, index) => (
      <Grid item xs={12} sm={6} md={3} key={index}>
        <StatsCardSkeleton />
      </Grid>
    ))}
  </Grid>
);

