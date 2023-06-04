// type Breaking = {
//   name: '속보';
//   overlap: 3;
// };
// type Exclusive = {
//   name: '단독';
//   overlap: 3;
// };
// export type News = Breaking | Exclusive;

// type Develop = {
//   name: 'develop';
// };
// type Production = {
//   name: 'production';
// };
// export type NODE_ENV = develop | Production;

export const DuplicationCount = 3;

export type NEWSTYPE = '속보' | '단독';
type NODE_ENV = 'develop' | 'debug' | 'production';

export const DEVELOP: NODE_ENV = 'develop';
export const DEBUG: NODE_ENV = 'debug';
export const PRODUCTION: NODE_ENV = 'production';
export const BreakingNewsType: NEWSTYPE = '속보';
export const ExclusiveNewsType: NEWSTYPE = '단독';
