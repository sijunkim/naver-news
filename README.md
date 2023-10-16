<p align="center">
  <img src="/contents/image/slack_capture1.png" width="960" alt="Slack Capture1" />
</p>

## Description
1분에 한번씩 네이버 속보, 단독 뉴스를 슬랙 웹훅으로 보내주는 배치, 웹서버입니다.<br />
<u>프로그램을 시작하기 전에 네이버 API 인증정보, 슬랙 웹훅 주소 설정해야 합니다.</u>

### 주요 기능
1. 프로그램 시작 시 환경변수에 정의된 txt 파일이 없을 경우 생성합니다.
2. develop, debug, production 환경을 분리하여 실행 가능합니다.
3. 제외 키워드 및 뉴스사 설정 가능 가능합니다.
4. 중복 키워드 관리 및 2시간 주기로 키워드를 초기화 합니다.(주기 변경 가능)
5. 1분 주기로 슬랙 웹훅 주소로 뉴스를 보내줍니다.(주기 변경 가능)

## Environments
```bash
# SERVER PORT
APP_PORT=3500

# 네이버 클라이언트 정보
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_OPENAPI_URL=https://openapi.naver.com/v1/search/news.xml?query=

# TXT FILE 
# 보낸 속보 뉴스 키워드 목록(, 콤마 사용해서 구분, 2시간에 한번씩 삭제)
BREAKING_KEYWORD=src/data/keyword/breakingKeyword.txt
# 마지막으로 속보 뉴스가 전송된 시간
BREAKING_LAST_RECEIVED_TIME=src/data/time/breakingLastReceivedTime.txt
# 속보 뉴스에서 제외하고 싶은 키워드(, 콤마 사용해서 구분)
BREAKING_EXCEPT_KEYWORD=src/data/except/breakingKeyword.txt
# 보낸 단독 뉴스 키워드 목록(, 콤마 사용해서 구분, 2시간에 한번씩 삭제)
EXCLUSIVE_KEYWORD=src/data/keyword/exclusiveKeyword.txt
# 마지막으로 단독 뉴스가 전송된 시간
EXCLUSIVE_LAST_RECEIVED_TIME=src/data/time/exclusiveLastReceivedTime.txt
# 단독 뉴스에서 제외하고 싶은 키워드(, 콤마 사용해서 구분)
EXCLUSIVE_EXCEPT_KEYWORD=src/data/except/exclusiveKeyword.txt
# 뉴스에서 제외하고 싶은 뉴스사(, 콤마 사용해서 구분)
EXCEPT_COMPANY=src/data/except/company.txt

# 슬랙 웹훅 정보
BREAKING_NEWS_WEBHOOK_URL=
EXCLUSIVE_NEWS_WEBHOOK_URL=
DEVELOP_WEBHOOK_URL=
```

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
