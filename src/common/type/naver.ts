// type Breaking = {
//   name: '속보';
//   overlap: 3;
// };
// type Exclusive = {
//   name: '단독';
//   overlap: 3;
// };
// export type News = Breaking | Exclusive;

// type Local = {
//   name: 'localhost';
// };
// type Production = {
//   name: 'production';
// };
// export type NODE_ENV = Local | Production;

export const DuplicationCount = 3;

export type NEWSTYPE = '속보' | '단독';
type NODE_ENV = 'local' | 'production';

export const NODE_ENV: NODE_ENV = 'production';
export const BreakingNewsType: NEWSTYPE = '속보';
export const ExclusiveNewsType: NEWSTYPE = '단독';
