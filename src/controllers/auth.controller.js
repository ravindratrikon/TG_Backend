const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService, emailService } = require('../services');
const { Activity } = require('../models');
const { invite } = require('../utils/response');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { userId } = req.body;
  const { inviteCode } = req.query;

  if (!userId) {
    return res.status(400).send({ message: 'UserId is required' });
  }

  const check = await userService.getUserByQuery({ userId });
  const user = await userService.loginOrRegisterUser(req.body);

  const tokens = await tokenService.generateTokenforauth(user._id);

  if (inviteCode) {
    if (inviteCode === user.inviteCode.toString()) {
      return res.status(400).send({ message: 'You cannot use your own invite code' });
    }
    const inviter = await userService.getUserByQuery({ inviteCode });

    if (inviter) {
      inviter.invitePoints = (inviter.invitePoints || 0) + 100;

      if (!inviter.friends.includes(user._id)) {
        inviter.friends.push(user._id);
      }

      const currentUser = await userService.getUserByQuery({ _id: user._id });

      if (!currentUser.friends.includes(inviter._id)) {
        currentUser.friends.push(inviter._id);
      }

      await inviter.save();
      await currentUser.save();

      await inviter.save();
      const activity = new Activity({
        user: inviter._id,
        invitee: user._id,
        type: 'invite',
        name: invite.name,
        coins: invite.point,
      });

      await activity.save();
    }
  }
  res.send({ user, tokens, new: !check });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(req.body.email);
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(req.user);
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
