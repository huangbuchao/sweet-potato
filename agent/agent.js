/**
 * @flow
 */
export default function Agent(options) {
  this.regular = options.regular;
  this.minor = false;
  this.compiler = {};
  this.translater = {
    format: options.format,
    master: null,
    slave: null
  };
}

Agent.prototype.run = function() {

};

Agent.prototype.translate = function() {

};