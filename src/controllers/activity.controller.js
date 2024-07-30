const httpStatus = require('http-status');
const { activityService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getAllActivity = catchAsync(async (req, res) => {
  const { type, page = 1, limit = 10 } = req.query;
  const user = req.user._id;

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sortBy: 'createdAt:desc',
  };

  let activitiesResult;
  let filter = {};

  if (type === 'invite') {
    filter = { user, type };
    activitiesResult = await activityService.getActivityByInvite(filter, options);

    const { invitePoints } = req.user._doc;
    const formattedActivities = activitiesResult.map((activity) => ({
      ...activity._doc,
      createdAt: activity.createdAt,
    }));

    return res.status(httpStatus.OK).json({
      invitePoints,
      results: formattedActivities,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(activitiesResult.length / options.limit),
      totalResults: activitiesResult.length,
    });
  }
  if (type === 'task') {
    filter = { user, type };
    activitiesResult = await activityService.getActivityByType(filter, options);
    const { dailyPoint } = req.user._doc;

    const formattedActivities = activitiesResult.results.map((activity) => ({
      ...activity._doc,
      createdAt: activity.createdAt,
    }));

    return res.status(httpStatus.OK).json({
      dailyPoint,
      result: formattedActivities,
    });
  }

  if (type === 'game') {
    filter = { user, type };
    activitiesResult = await activityService.getActivityByGame(filter, options);

    const formattedActivities = activitiesResult.map((activity) => ({
      ...activity._doc,
      createdAt: activity.createdAt,
    }));

    return res.status(httpStatus.OK).json({
      results: formattedActivities,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(activitiesResult.length / options.limit),
      totalResults: activitiesResult.length,
    });
  }
  filter = { user };
  activitiesResult = await activityService.getAllActivity(filter, options);

  const totalCoins = req.user.dailyPoint + req.user.invitePoints;
  const { totalPages, totalResults } = activitiesResult;

  const formattedActivities = activitiesResult.activities.map((activity) => ({
    ...activity._doc,
    createdAt: activity.createdAt,
  }));
  return res.status(httpStatus.OK).json({
    TotalCoins: totalCoins,
    results: formattedActivities,

    page,
    limit,
    totalPages,
    totalResults,
  });
});

const createActivity = catchAsync(async (req, res) => {
  const userId = req.user._id;

  const activityData = req.body;
  activityData.user = userId;
  const newActivity = await activityService.createActivity(activityData);
  res.status(httpStatus.CREATED).json({ result: newActivity });
});

const updateActivity = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedActivity = await activityService.updateActivity(id, updateData);
  res.status(httpStatus.OK).json({ result: updatedActivity });
});

module.exports = {
  getAllActivity,
  createActivity,
  updateActivity,
};
