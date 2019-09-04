/**
 * @flow
 */
export default function Agent() {
  this.compiler = {};
  this.translater = {
    format: '',
    master: null,
    slave: null
  };
}

Agent.prototype.run = function() {

};

Agent.prototype.translate = function() {

};