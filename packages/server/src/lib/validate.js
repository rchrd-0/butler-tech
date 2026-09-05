import * as v from "valibot";

export function validate(source, schema) {
  return (req, res, next) => {
    res.locals.validated = v.parse(schema, req[source]);
    next();
  };
}
