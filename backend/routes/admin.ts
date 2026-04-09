import express from 'express';
import Booking from '../models/Booking.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [revenueAnalytics, busiestRoutes, frequentFlyers] = await Promise.all([
      // Revenue Analytics
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { 
          $group: {
            _id: '$trainId',
            totalRevenue: { $sum: '$totalPrice' },
            totalTicketsSold: { $sum: 1 },
            trainName: { $first: '$trainName' },
            trainNumber: { $first: '$trainNumber' }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]),

      // Busiest Routes
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        {
          $group: {
            _id: { from: '$fromStationId', to: '$toStationId' },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 3 },
        {
          $project: {
            fromStation: '$_id.from',
            toStation: '$_id.to',
            count: 1,
            _id: 0
          }
        }
      ]),

      // Frequent Flyers
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        {
          $group: {
            _id: '$userId',
            trips: { $sum: 1 },
            totalSpent: { $sum: '$totalPrice' }
          }
        },
        { $sort: { trips: -1, totalSpent: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: 'email',
            as: 'userInfo'
          }
        },
        { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            email: '$_id',
            name: { $ifNull: ['$userInfo.name', 'Unknown User'] },
            trips: 1,
            totalSpent: 1,
            _id: 0
          }
        }
      ])
    ]);

    res.json({
      revenueAnalytics,
      busiestRoutes,
      frequentFlyers
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch admin dashboard analytics' });
  }
});

export default router;
