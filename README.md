<p align="center">
  <img src="/contents/image/slack_capture1.png" width="960" alt="Slack Capture1" />
</p>

## Description
1분에 한번씩 네이버 속보, 단독 뉴스를 슬랙 웹훅으로 보내주는 배치, 웹서버입니다.
프로그램을 시작하기 전에 네이버 API 인증정보(NAVER_CLIENT_ID, NAVER_CLIENT_SECRET), 슬랙 웹훅 주소 설정해야 합니다.

### 주요 기능
1. 프로그램 시작 시 환경변수에 정의된 txt 파일이 없을 경우 생성합니다.
2. develop, debug, production 환경을 분리하여 실행 가능합니다.
3. 제외 키워드 및 뉴스사 설정 가능 가능합니다.
4. 중복 키워드 관리 및 1시간 주기로 키워드를 초기화 합니다.(주기 변경 가능)
5. 1분 주기로 슬랙 웹훅 주소로 뉴스를 보내줍니다.(주기 변경 가능)

## Environments
#### - ENVIRONMENT
APP_PORT=3500

#### - NAVER
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_OPENAPI_URL=https://openapi.naver.com/v1/search/news.xml?query=

#### - TXT FILE 
BREAKING_KEYWORD=src/data/keyword/breakingKeyword.txt
BREAKING_LAST_RECEIVED_TIME=src/data/time/breakingLastReceivedTime.txt
BREAKING_EXCEPT_KEYWORD=src/data/except/breakingKeyword.txt
EXCLUSIVE_KEYWORD=src/data/keyword/exclusiveKeyword.txt
EXCLUSIVE_LAST_RECEIVED_TIME=src/data/time/exclusiveLastReceivedTime.txt
EXCLUSIVE_EXCEPT_KEYWORD=src/data/except/exclusiveKeyword.txt
EXCEPT_COMPANY=src/data/except/company.txt


#### - SLACK
BREAKING_NEWS_WEBHOOK_URL=
EXCLUSIVE_NEWS_WEBHOOK_URL=
DEVELOP_WEBHOOK_URL=

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# develop mode
$ yarn start:dev

# debug mode
$ yarn start:debug

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kim Si Jun](papaya9349@naver.com)

## License

Nest is [MIT licensed](LICENSE).
