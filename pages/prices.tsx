import dayjs, { Dayjs } from "dayjs";
import { Alert, Button, Spinner, Table, TextInput } from "flowbite-react";
import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import dummyData from "../utils/dummy.json";

interface PriceType {
  id: string;
  date: string;
  usd: number;
}

export default function Prices() {
  const [prices, setPrices] = useState<PriceType[]>([]);
  const [coinId, setCoinId] = useState("");
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<string>(dayjs().subtract(1, 'year').format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

  async function fetchApis(id: string, startDay: Dayjs, endDay: Dayjs): Promise<void> {
    let fromDay = startDay;
    let url = "https://api.coinmarketcap.com/data-api/v3/cryptocurrency/detail/chart";
    while (fromDay < endDay) {
      const toDay = fromDay.add(Math.min(365, endDay.diff(fromDay, "days")), "day");
      const reqUrl = `${url}?id=${id}&range=${fromDay.unix() + 1}~${toDay.unix()}`;
      console.log(reqUrl);
      fromDay = toDay;
    }
  }

  function parseData() {
    let result: PriceType[] = [];
    for (const [key, value] of Object.entries(dummyData)) {
      const item: PriceType = {
        id: coinId,
        date: dayjs.unix(Number(key)).format("DD-MM-YYYY"),
        usd: Number(value["v"][0].toFixed(10)),
      };
      result.push(item);
    }
    return result;
  }

  async function searchHandler() {
    fetchApis(id, dayjs(startDate), dayjs(endDate));
  }

  function generateHandler() {
    setLoading(true);
    const result = parseData();
    console.log(result);
    setPrices(result);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-800 dark:text-white">
      <header className="flex justify-center">
        <span className="text-2xl font-bold my-4">Prices</span>
      </header>
      <main className="flex flex-col flex-1 items-center w-full max-w-7xl mx-auto my-4 px-4 py-0">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center gap-2">
            <TextInput
              type="text"
              value={coinId}
              placeholder="CoinGecko id"
              onChange={(e) => setCoinId(e.target.value)}
            />
            <TextInput
              type="text"
              value={id}
              placeholder="CoinMarket coin id"
              onChange={(e) => setId(e.target.value)}
            />
          </div>
          <div className="inline-flex items-center gap-2">
            <TextInput
              type="date"
              value={startDate}
              min="2020-04-11"
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />
            <span>To</span>
            <TextInput
              type="date"
              value={endDate}
              min={startDate}
              max={new Date().toJSON().slice(0, 10)}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />
            <Button color="gray" onClick={async () => searchHandler()}>
              <FiSearch />
            </Button>
            <Button disabled={loading} onClick={async () => generateHandler()}>
              <FiSearch />
            </Button>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          {loading ? (
            <Alert>
              <Spinner size="sm" />
              <span className="ml-4">Fetching prices...</span>
            </Alert>
          ) : (
            <Table className="text-gray-900 dark:text-gray-100">
              <Table.Head className="bg-gray-100 whitespace-nowrap">
                <Table.HeadCell>id</Table.HeadCell>
                <Table.HeadCell>coin id</Table.HeadCell>
                <Table.HeadCell>usd</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {prices.map((item, index) => (
                  <Table.Row key={index} className="dark:border-gray-700 whitespace-nowrap">
                    <Table.Cell>{item.id}</Table.Cell>
                    <Table.Cell>{item.date}</Table.Cell>
                    <Table.Cell>{item.usd.toLocaleString("en-US", { maximumFractionDigits: 10 })}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
