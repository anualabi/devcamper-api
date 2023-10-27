import { Request, Response, NextFunction } from "express";
import xss, { IFilterXSSOptions } from "xss";

const xssClean = (req: Request, res: Response, next: NextFunction) => {
  const options: IFilterXSSOptions = {
    whiteList: {}, // this ensures no tags are allowed
    stripIgnoreTag: true, // filter out all HTML not in the whitelist
    stripIgnoreTagBody: ["script"], // the `script` tag is a special case, we want to filter out its body
  };

  if (req.body) {
    req.body = JSON.parse(xss(JSON.stringify(req.body), options));
  }

  if (req.query) {
    req.query = JSON.parse(xss(JSON.stringify(req.query), options));
  }

  if (req.params) {
    req.params = JSON.parse(xss(JSON.stringify(req.params), options));
  }

  next();
};

export default xssClean;
