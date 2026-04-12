const ts = require('typescript');

const transformer = (program) => (context) => (sourceFile) => {
  function visitor(node) {
    // Replace import.meta.env.X with process.env.X
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isMetaProperty(node.expression.expression) &&
      node.expression.name.text === 'env'
    ) {
      return ts.factory.createPropertyAccessExpression(
        ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('process'),
          ts.factory.createIdentifier('env')
        ),
        node.name
      );
    }
    // Replace import.meta.env with process.env
    if (
      ts.isPropertyAccessExpression(node) &&
      ts.isMetaProperty(node.expression) &&
      node.name.text === 'env'
    ) {
      return ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('process'),
        ts.factory.createIdentifier('env')
      );
    }
    return ts.visitEachChild(node, visitor, context);
  }
  return ts.visitNode(sourceFile, visitor);
};

module.exports.name = 'import-meta-env-transformer';
module.exports.version = '1';
module.exports.factory = transformer;
