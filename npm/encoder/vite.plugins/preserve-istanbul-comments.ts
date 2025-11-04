// vite.plugins/preserve-istanbul-comments.ts
import type { Plugin } from "vite";
import { parse } from "@babel/parser";
import MagicString from "magic-string";

export default function preserveIstanbulComments(): Plugin {
  return {
    name: "preserve-istanbul-comments",
    enforce: "pre",
    apply(_, env) { return env.mode === 'test'; },
    transform(code, id) {
      if (!/\.(m?[jt]s?)$/.test(id)) return;

      const ast = parse(code, {
        sourceType: "module",
        allowReturnOutsideFunction: true,
        plugins: [
          "typescript",
          "decorators",
          "classProperties",
          "classPrivateProperties",
          "classPrivateMethods",
          "importMeta",
          "topLevelAwait",
        ],
        attachComment: true,
        ranges: true,
        tokens: true,
      });

      const comments = ast.comments ?? [];

      let changed = false;
      const s = new MagicString(code);

      for (const c of comments) {
        if (
          !/(istanbul|v8)/i.test(c.value) ||
          /@preserve\b/.test(c.value) ||
          !c.end
        ) {
          continue;
        }
        let { end } = c;
        if (c.type === "CommentBlock") {
          end -= 2;
        }
        s.appendLeft(end, " @preserve ");
        changed = true;
      }
      if (!changed) return null;
      return { code: s.toString(), map: s.generateMap({ hires: true }) };
    },
  };
}
