import * as v from "valibot";

export function validate(source, schema) {
  return (req, res, next) => {
    const result = v.safeParse(schema, req[source]);

    if (!result.success) {
      const { nested, root } = v.flatten(result.issues);

      return res.status(400).json({
        message: "Invalid request",
        issues: nested ?? { request: root },
      });
    }

    res.locals.validated = result.output;
    next();
  };
}
