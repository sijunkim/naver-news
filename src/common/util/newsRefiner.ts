import { Injectable } from '@nestjs/common';
import newsCompany from 'src/data/raw/newsCompany';

@Injectable()
export default class NewsRefiner {
  pubDateToKoreaTime(pubDate: string): string {
    const today = new Date(pubDate);

    const dayNames = ['(일요일)', '(월요일)', '(화요일)', '(수요일)', '(목요일)', '(금요일)', '(토요일)'];
    // getDay: 해당 요일(0 ~ 6)를 나타내는 정수를 반환한다.
    const day = dayNames[today.getDay()];

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    let hour = today.getHours();
    const minute = today.getMinutes();
    const second = today.getSeconds();
    const ampm = hour >= 12 ? 'PM' : 'AM';

    // 12시간제로 변경
    hour %= 12;
    hour = hour || 12; // 0 => 12

    // 10미만인 분과 초를 2자리로 변경
    const minuteText = minute < 10 ? '0' + minute : minute;
    const secondText = second < 10 ? '0' + second : second;

    return `${year}년 ${month}월 ${date}일 ${day} ${hour}:${minuteText}:${secondText} ${ampm}`;
  }

  htmlParsingToText(description: string): string {
    return description
      .replace(/(<([^>]+)>)/gi, '')
      .replace(/&quot;/gi, '"')
      .replace(/&#039;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&amp;/gi, '&')
      .replace(/`/gi, "'")
      .replace(/&apos;/gi, "'");
  }

  getNewsCompanyList() {
    return newsCompany.getCompanyList();
  }

  substractComapny(link: string, originallink: string) {
    const list = this.getNewsCompanyList();
    const address = originallink
      .toLowerCase()
      .replace(
        /^(https?:\/?\/?)?(\/?\/?www\.)?(\/?\/?news\.)?(\/?\/?view\.)?(\/?\/?post\.)?(\/?\/?photo\.)?(\/?\/?photos\.)?(\/?\/?blog\.)?/,
        '',
      );
    const domain = address.match(/^([^:\/\n\?\=]+)/)[0];

    const index = this.searchSourceIndex(address, list);
    if (index >= 0 && index <= list.length - 1) {
      return list[index][1];
    } else if (domain) {
      return domain;
    } else {
      return '(알수없음)';
    }
  }

  searchSourceIndex(address, list) {
    let left = 0;
    let right = list.length - 1;

    while (left <= right) {
      const index = Math.floor((left + right) / 2);
      const address_stripped = address.substr(0, list[index][0].length);

      if (address_stripped === list[index][0]) {
        return this.checkSourceIndex(index, list, address, address_stripped);
      } else if (address_stripped < list[index][0]) {
        right = index - 1;
      } else {
        left = index + 1;
      }
    }

    return -1;
  }

  checkSourceIndex(index, list, address, address_stripped) {
    let i = index;

    while (i + 1 <= list.length - 1) {
      if (list[i + 1][0].includes(address_stripped)) {
        i++;
      } else {
        break;
      }
    }

    if (i === index) {
      return index;
    }

    while (i >= index) {
      if (address.includes(list[i][0])) {
        return i;
      }
      i--;
    }

    return -1;
  }
}
