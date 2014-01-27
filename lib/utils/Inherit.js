module.exports = function(target, inherits) {
    /// <summary>Inherits properties from one class into a child</summary>
    /// <param name="target" type="Function">The target class which should inherit properties of its parent</param>
    /// <param name="inherits" type="Function">The parent class from which to inherit</param>
    
    var targetProto = function() {};
    targetProto.prototype = inherits.prototype;
    targetProto.constructor = targetProto;

    target.prototype = new targetProto();
    target.prototype.constructor = target;
    inherits.prototype.constructor = inherits;
};