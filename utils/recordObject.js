class Record {
  constructor(exercise_id) {
    //this.training_id = training_id;
    this.exercise_id = exercise_id;
    this.date = new Date();
    this.routes = {};
    this.startTime = 0;
  }

/*   setStartTime(start) {
    this.startTime = start;
  } */

  setResults(route, touch_time) {
    let routeObj = this.routes[`route${route}`];
    if (!routeObj) {
      routeObj = this.routes[`route${route}`] = new Route();
    }
    routeObj.results.push(touch_time);
  }

  setJumpTime(route, jump_time) {
    let routeObj = this.routes[`route${route}`];
    if (!routeObj) {
      routeObj = this.routes[`route${route}`] = new Route();
    }
    if (!routeObj.jump_time) {
      routeObj.jump_time = jump_time;
    }
  }
}

class Route {
  constructor() {
    this.jump_time = 0;
    this.results = [];
  }
}

module.exports = Record;
