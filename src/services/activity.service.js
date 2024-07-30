const { Activity } = require('../models');

const getAllActivity = async (filter, options) => {
  const activities = await Activity.find(filter)
    .populate('invitee game')
    .limit(options.limit)
    .skip(options.skip)
    .sort({ createdAt: -1 });

  return {
    activities,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(activities.length / options.limit),
    totalResults: activities.length,
  };
};

const getActivityByType = async (filter, options) => {
  return Activity.paginate(filter, options);
};

const getActivityByInvite = async (filter, options) => {
  return Activity.find(filter).populate('invitee').limit(options.limit).skip(options.skip).sort({ createdAt: -1 });
};

const getActivityByGame = async (filter, options) => {
  return Activity.find(filter).populate('game').limit(options.limit).skip(options.skip).sort({ createdAt: -1 });
};

const createActivity = async (activityData) => {
  const activity = await Activity.create(activityData);
  return activity;
};
const updateActivity = async (activityId, updateData) => {
  const activity = await Activity.findByIdAndUpdate(activityId, updateData, { new: true });
  return activity;
};
module.exports = {
  getAllActivity,
  getActivityByType,
  getActivityByInvite,
  getActivityByGame,
  createActivity,
  updateActivity,
};
