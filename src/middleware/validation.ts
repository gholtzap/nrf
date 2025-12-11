import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

type ValidationSource = 'body' | 'query' | 'params' | 'headers';

interface ValidationSchema {
  body?: z.ZodType<any>;
  query?: z.ZodType<any>;
  params?: z.ZodType<any>;
  headers?: z.ZodType<any>;
}

export const validate = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }

      if (schema.query) {
        const parsed = await schema.query.parseAsync(req.query);
        Object.defineProperty(req, 'query', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      if (schema.params) {
        const parsed = await schema.params.parseAsync(req.params);
        Object.defineProperty(req, 'params', {
          value: parsed,
          writable: true,
          enumerable: true,
          configurable: true
        });
      }

      if (schema.headers) {
        const lowerCaseHeaders: Record<string, any> = {};
        Object.keys(req.headers).forEach((key) => {
          lowerCaseHeaders[key.toLowerCase()] = req.headers[key];
        });
        await schema.headers.parseAsync(lowerCaseHeaders);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Request validation failed',
          instance: req.path,
          invalidParams: errors,
        });
      } else {
        next(error);
      }
    }
  };
};

export const validateContentType = (contentTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');

    if (!contentType) {
      return res.status(415).json({
        type: 'about:blank',
        title: 'Unsupported Media Type',
        status: 415,
        detail: 'Content-Type header is required',
        instance: req.path,
      });
    }

    const baseContentType = contentType.split(';')[0].trim();

    if (!contentTypes.includes(baseContentType)) {
      return res.status(415).json({
        type: 'about:blank',
        title: 'Unsupported Media Type',
        status: 415,
        detail: `Content-Type must be one of: ${contentTypes.join(', ')}`,
        instance: req.path,
      });
    }

    next();
  };
};

export const validateAccept = (acceptTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const accept = req.get('Accept');

    if (!accept || accept === '*/*') {
      return next();
    }

    const acceptedTypes = accept.split(',').map(t => t.split(';')[0].trim());

    const hasMatch = acceptedTypes.some(type =>
      acceptTypes.some(acceptType =>
        type === acceptType || type === '*/*' || type.endsWith('/*')
      )
    );

    if (!hasMatch) {
      return res.status(406).json({
        type: 'about:blank',
        title: 'Not Acceptable',
        status: 406,
        detail: `Accept header must include one of: ${acceptTypes.join(', ')}`,
        instance: req.path,
      });
    }

    next();
  };
};
