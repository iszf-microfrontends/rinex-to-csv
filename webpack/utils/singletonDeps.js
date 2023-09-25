module.exports = (dependencies, ...deps) => {
  return deps.reduce((depsObj, dep) => {
    depsObj[dep] = {
      singleton: true,
      requiredVersion: dependencies[dep],
    };
    return depsObj;
  }, {});
};
