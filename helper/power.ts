function additionalPower(baseExp:number) {
  if (baseExp < 44) {
    return Math.ceil(baseExp * 0.12);
  } else if (baseExp < 88) {
    return Math.ceil(baseExp * 0.25);
  } else if (baseExp < 132) {
    return Math.ceil(baseExp * 0.42);
  } else if (baseExp < 176) {
    return Math.ceil(baseExp * 0.56);
  } else if (baseExp < 220) {
    return Math.ceil(baseExp * 0.61);
  } else if (baseExp < 264) {
    return Math.ceil(baseExp * 0.89);
  } else if (baseExp < 308) {
    return Math.ceil(baseExp * 1.1);
  } else {
    return Math.ceil(baseExp * 1.4);
  }
}

module.exports = additionalPower;
