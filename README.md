<p align="center">
  <img src="https://github.com/user-attachments/assets/4e0bc593-c913-4b51-b563-6b7ca59bab85" width="320px"/>
  <img src="https://github.com/user-attachments/assets/f7d06bb2-f666-4543-92a0-ea7ae976e8e3" width="480px"/>
  <img src="https://github.com/user-attachments/assets/94e5944e-9872-41b3-bdff-1d3b8e4bb8c2" />
</p>

1분에 한번씩 네이버 속보, 단독 뉴스를 슬랙 웹훅으로 보내주는 배치, 웹서버입니다.<br />
<u>프로그램을 시작하기 전에 네이버 API 인증정보, 슬랙 웹훅 주소 설정해야 합니다.</u>

### 주요 기능

1. 프로그램 시작 시 환경변수에 정의된 txt 파일이 없을 경우 생성합니다.
2. develop, debug, production 환경을 분리하여 실행 가능합니다.
3. 제외 키워드 및 뉴스사 설정해 받지 않을 뉴스와 뉴스사를 설정 가능합니다.
4. 환경변수 DUPLICATED_COUNT 값을 변경해 중복 키워드 개수를 설정 할 수 있습니다.
5. 중복 키워드 관리 및 2시간 주기로 키워드를 초기화 합니다.(주기 변경 가능)
6. 1분 주기로 슬랙 웹훅 주소로 뉴스를 보내줍니다.(주기 변경 가능)

## Environments

```bash
# 서버 포트
APP_PORT=3500

# 파일
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

# 네이버 클라이언트 정보
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_OPENAPI_URL=

# 뉴스
DUPLICATED_COUNT=5

# 슬랙 웹훅 정보
# 속보 받을 웹훅 주소
BREAKING_NEWS_WEBHOOK_URL=
# 단독 받을 웹훅 주소
EXCLUSIVE_NEWS_WEBHOOK_URL=
# 테스트 웹훅 주소
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
