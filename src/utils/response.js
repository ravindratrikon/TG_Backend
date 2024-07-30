const weeklyRewards = [
  {
    id: 3,
    point: 500,
    name: '1 week Login Streak Reward',
  },
];
const watchDailyVideo = [
  {
    id: 5,
    point: 200,
    name: 'Watch daily video',
  },
];
const taskOfTheday = [
  {
    id: 4,
    point: 100,
    name: 'Task of the day',
  },
];
const dailyRewards = [
  {
    id: 2,
    name: 'Collected daily login reward',
    dailyTask: [
      { name: 'Day 1', point: 200 },
      { name: 'Day 2', point: 200 },
      { name: 'Day 3', point: 200 },
      { name: 'Day 4', point: 200 },
      { name: 'Day 5', point: 200 },
      { name: 'Day 6', point: 200 },
      { name: 'Day 7', point: 200 },
    ],
  },
];

const invite = {
  name: 'Referral invite-1x',
  point: 200,
};

module.exports = {
  dailyRewards,
  weeklyRewards,
  taskOfTheday,
  watchDailyVideo,
  invite,
};
