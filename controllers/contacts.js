﻿const { contactsViewer } = require('../plugins/contacts-viewer');
const { getAccessToken, isAuthorized } = require('../services/hubspot');

exports.contacts = async (req, res) => {
  const userId = req.session.userId;

  const portalId = req.params.portalId ? req.params.portalId : req.session.portalId;

  console.log('Portal ID: ', portalId);

  const authorized = await isAuthorized(userId, portalId);
  console.log('Authorized: ', authorized);

  if (authorized) {
    const accessToken = await getAccessToken(userId, portalId);

    const contacts = await contactsViewer(accessToken);

    res.json(contacts);
  } else {
    console.log('User is not authorized or has not installed an app');
    res.status(401).json({
      message: 'You are not authorized or has not installed an app',
    });
  }
};
