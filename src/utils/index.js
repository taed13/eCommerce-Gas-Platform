"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((field) => [field, 1]));
};

const unSelectData = (unSelect = []) => {
  return Object.fromEntries(unSelect.map((field) => [field, 0]));
};

const removeUndefinedObject = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object") removeUndefined(obj[key]);
    else if (obj[key] == null) delete obj[key];
  });
  return obj;
};

const updateNestedObjectParse = (object) => {
  const final = {};

  Object.keys(object || {}).forEach((key) => {
    if (typeof object[key] === "object" && !Array.isArray(object[key])) {
      const response = updateNestedObjectParse(object[key]);

      Object.keys(response || {}).forEach((a) => {
        final[`${key}.${a}`] = response[a];
      });
    } else {
      final[key] = object[key];
    }
  });

  return final;
};

module.exports = {
  getInfoData,
  getSelectData,
  unSelectData,
  removeUndefinedObject,
  updateNestedObjectParse,
};
