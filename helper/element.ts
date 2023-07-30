export function elementWeakness(elements:Array<any>) {
  let weakness = [],
    immune = [],
    strength = [],
    result = [],
    element:Array<any> = [];

    console.log(elements)

  //combine weakness and strength if pokemon has more than 1 element
  for (let i = 0; i < elements.length; i++) {
    element.push(elements[i].name);
    weakness = weakness.concat(elements[i].weakness.split(","));
    strength = strength.concat(elements[i].strength.split(","));
    immune = immune
      .concat(elements[i].immune.split(","))
      .filter((el) => el !== "");
  }

  weakness.forEach((el) => {
    if (
      el !== strength.find((str) => str === el) &&
      el !== immune.find((imn) => imn === el)
    )
      result.push(el);
  });

  return {
    elements: element,
    weakness: result,
    immune,
  };
}
