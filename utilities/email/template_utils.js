import { items, spaces } from "../../models/mongodb.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Taipei");

export function time_period_string(start_datetime, end_datetime) {
  const weekdaysMin = ["日", "一", "二", "三", "四", "五", "六"];
  const start_time = dayjs(start_datetime);
  const end_time = dayjs(end_datetime);
  const start_string = `${start_time.format("YYYY/MM/DD")}(${weekdaysMin[start_time.day()]}) ${start_time.format("HH:mm")}`;
  const end_string =
    start_time.format("YYYYMMDD") === end_time.format("YYYYMMDD")
      ? end_time.format("HH:mm")
      : `${end_time.format("YYYY/MM/DD")}(${weekdaysMin[end_time.day()]}) ${end_time.format("HH:mm")}`;
  return `${start_string} ~ ${end_string}`;
}

export async function convert_space_reservations_string(space_reservations) {
  let space_reservations_string = "";
  for (const space_reservation of space_reservations) {
    const space = await spaces.findOne({
      _id: { $eq: new ObjectId(space_reservation.space_id) },
    });

    const space_name = space?.name["zh-tw"] || "(查無場地名稱)";
    const start_datetime = space_reservation.start_datetime;
    const end_datetime = space_reservation.end_datetime;
    space_reservations_string += `
      <li>
        ${space_name}<br>
        ${time_period_string(start_datetime, end_datetime)}
      </li>
    `;
  }
  return space_reservations_string;
}

export async function convert_item_reservations_string(item_reservations) {
  let item_reservations_string = "";
  for (const item_reservation of item_reservations) {
    const item = await items.findOne({
      _id: { $eq: new ObjectId(item_reservation.item_id) },
    });

    const item_name = item?.name["zh-tw"] || "(查無物品名稱)";
    const start_datetime = item_reservation.start_datetime;
    const end_datetime = item_reservation.end_datetime;
    item_reservations_string += `
      <li>
        ${item_name}<br>
        ${time_period_string(start_datetime, end_datetime)}<br>
        數量：${item_reservation.quantity}
      </li>
    `;
  }
  return item_reservations_string;
}
