import './App.css';
import {
  Typography,
  Flex,
  Select,
  Table,
  Image,
  Modal,
  Row,
  Col,
  Statistic,
  Tabs,
  Pagination,
} from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import type { PaginationProps } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const { Title } = Typography;

const codeMirrorValue = `import './App.css';
import {
  Typography,
  Flex,
  Select,
  Table,
  Image,
  Modal,
  Row,
  Col,
  Statistic,
  Tabs,
  Pagination,
} from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import type { PaginationProps } from 'antd';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const { Title } = Typography;

interface DataType {
  id: string;
  key: string;
  name: string;
  image: string;
  current_price: number;
  circulating_supply: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  total_supply: number;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  max_supply: number;
}

interface HistoryDataType {
  prices: Array<Array<number>>;
  market_caps: Array<Array<number>>;
  total_volumes: Array<Array<number>>;
}

const API_URL = 'https://api.coingecko.com/api/v3/coins';

const fetchCoinsMarkets = async (
  currency: string,
  order: string,
  perPage: number,
  page: number
) => {
  const params = new URLSearchParams({
    vs_currency: currency,
    order: order,
    per_page: String(perPage),
    page: String(page),
    sparkline: 'false',
  });
  return await axios.get(\`\${API_URL}/markets?\${params.toString()}\`);
};

const fetchCoinsHistory = async (
  coinId: string,
  currency: string,
  days: number
) => {
  const params = new URLSearchParams({
    vs_currency: currency,
    days: String(days),
  });
  return await axios.get(
    \`\${API_URL}/\${coinId}/market_chart?\${params.toString()}\`
  );
};

const currencyOptions = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
];

const orderOptions = [
  { value: 'market_cap_desc', label: 'Market cap descending' },
  { value: 'market_cap_asc', label: 'Market cap ascending' },
];

const tableColumns = (
  currency: string,
  onOpenCoin: (index: number) => void
): ColumnsType<DataType> => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record: DataType) => (
        <Flex gap="16px" align="center">
          <Image width={32} src={record.image} />
          <span>{record.name}</span>
        </Flex>
      ),
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (_, record: DataType) => (
        <Flex gap="4px" align="center">
          <span>{record.current_price}</span>
          <span>{currency}</span>
        </Flex>
      ),
    },
    {
      title: 'Circulating Supply',
      dataIndex: 'circulating_supply',
      key: 'circulating_supply',
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, __, index) => (
        <EllipsisOutlined
          style={{ fontSize: '32px' }}
          onClick={() => onOpenCoin(index)}
        />
      ),
    },
  ];
};

const modalTabsItems = [
  { label: 'Overview', key: '0' },
  { label: 'Prices', key: '1' },
  { label: 'Market Caps', key: '2' },
  { label: 'Total Volumes', key: '3' },
];

function App() {
  const [page, setPage] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('usd');
  const [order, setOrder] = useState<string>('market_cap_desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [perPage, setPerPage] = useState<number>(10);
  const [coinsMarketData, setCoinsMarketData] = useState<DataType[]>([]);
  const [openCoinIndex, setOpenCoinIndex] = useState<number>(-1);
  const [currentModalTab, setCurrentModalTab] = useState<string>('0');
  const [openCoinHistory, setOpenCoinHistory] = useState<HistoryDataType>({
    prices: [],
    market_caps: [],
    total_volumes: [],
  });
  const historyDays = 30;

  const handleCurrencyChange = (value: string) => setCurrency(value);
  const handleOrderChange = (value: string) => setOrder(value);
  const handleOpenCoin = (index: number) => setOpenCoinIndex(index);
    const handleCloseCoin = () => {
    setOpenCoinIndex(-1);
    setCurrentModalTab('0');
  };
  const handlePaginationChange: PaginationProps['onChange'] = (
    page,
    pageSize
  ) => {
    setPage(page);
    setPerPage(pageSize);
  };
  const handleModalTabsChange = (activeKey: string) =>
    setCurrentModalTab(activeKey);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchCoinsMarkets(
          currency,
          order,
          perPage,
          page
        );
        setCoinsMarketData(data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [currency, order, perPage, page]);

  const currentOpenCoin: DataType = useMemo(
    () => coinsMarketData[openCoinIndex],
    [coinsMarketData, openCoinIndex]
  );

  useEffect(() => {
    if (!currentOpenCoin) return;

    const fetchData = async () => {
      try {
        const { data } = await fetchCoinsHistory(
          currentOpenCoin.id,
          currency,
          historyDays
        );
        setOpenCoinHistory(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [currency, historyDays, currentOpenCoin]);

  const currentCoinHistory = useMemo(() => {
    let currentGraph: Array<Array<number>> = [];
    if (currentModalTab === '1') currentGraph = openCoinHistory.prices;
    if (currentModalTab === '2') currentGraph = openCoinHistory.market_caps;
    if (currentModalTab === '3') currentGraph = openCoinHistory.total_volumes;
    if (!currentGraph) return null;

    const result = currentGraph.map(([date, value]) => ({
      date: new Date(date).toLocaleString(),
      value,
    }));
    return result;
  }, [currentModalTab, openCoinHistory]);

  return (
    <Flex vertical align="stretch" gap="24px">
      <Title
        style={{
          textAlign: 'left',
        }}
      >
        Coins & Markets
      </Title>
      <Flex gap="24px">
        <Select
          defaultValue="usd"
          options={currencyOptions}
          onChange={handleCurrencyChange}
          style={{ width: '200px', textAlign: 'left' }}
        />
        <Select
          defaultValue="market_cap_desc"
          options={orderOptions}
          onChange={handleOrderChange}
          style={{ width: '200px', textAlign: 'left' }}
        />
      </Flex>
      <Table
        columns={tableColumns(currency, handleOpenCoin)}
        dataSource={coinsMarketData}
        loading={isLoading}
        pagination={false}
      />
      <Pagination
        showSizeChanger
        onChange={handlePaginationChange}
        defaultCurrent={page}
        total={10000}
        style={{ alignSelf: 'self-end' }}
      />
      {openCoinIndex !== -1 && (
        <Modal
          width="1200px"
          open={openCoinIndex !== -1}
          title="Coin Details"
          onCancel={handleCloseCoin}
          footer={null}
        >
          <Flex vertical gap="24px">
            <Flex gap="16px" align="center">
              <Image width={100} src={currentOpenCoin.image} />
              <Title
                style={{
                  textAlign: 'left',
                }}
              >
                {currentOpenCoin.name}
              </Title>
            </Flex>
            <Tabs
              defaultActiveKey="0"
              type="card"
              size="large"
              items={modalTabsItems}
              onChange={handleModalTabsChange}
            />
            {currentModalTab === '0' && (
              <>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Current Price"
                      value={currentOpenCoin.current_price}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Market Cap"
                      value={currentOpenCoin.market_cap}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Market Cap Rank"
                      value={currentOpenCoin.market_cap_rank}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Total Volume"
                      value={currentOpenCoin.total_volume}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="High 24 Hours"
                      value={currentOpenCoin.high_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Low 24 Hours"
                      value={currentOpenCoin.low_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Price Change 24 Hours"
                      value={currentOpenCoin.price_change_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Price Change 24 Hours"
                      value={currentOpenCoin.price_change_percentage_24h}
                      suffix="%"
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High"
                      value={currentOpenCoin.ath}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High Date"
                      value={new Date(currentOpenCoin.ath_date).toDateString()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High Change"
                      value={currentOpenCoin.ath_change_percentage}
                      suffix="%"
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Total Supply"
                      value={currentOpenCoin.total_supply}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low"
                      value={currentOpenCoin.atl}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low Date"
                      value={new Date(currentOpenCoin.atl_date).toDateString()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low Change"
                      value={currentOpenCoin.atl_change_percentage}
                      suffix="%"
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Max Supply"
                      value={currentOpenCoin.max_supply}
                    />
                  </Col>
                </Row>
              </>
            )}
            {currentCoinHistory && currentModalTab !== '0' && (
              <>
                <Title level={4} style={{ margin: 0 }}>
                  Time Interval - last 30 days
                </Title>
                <LineChart
                  width={1000}
                  height={500}
                  data={currentCoinHistory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </>
            )}
          </Flex>
        </Modal>
      )}
    </Flex>
  );
}

export default App;`;

interface DataType {
  id: string;
  key: string;
  name: string;
  image: string;
  current_price: number;
  circulating_supply: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  total_supply: number;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  max_supply: number;
}

interface HistoryDataType {
  prices: Array<Array<number>>;
  market_caps: Array<Array<number>>;
  total_volumes: Array<Array<number>>;
}

const API_URL = 'https://api.coingecko.com/api/v3/coins';

const fetchCoinsMarkets = async (
  currency: string,
  order: string,
  perPage: number,
  page: number
) => {
  const params = new URLSearchParams({
    vs_currency: currency,
    order: order,
    per_page: String(perPage),
    page: String(page),
    sparkline: 'false',
  });
  return await axios.get(`${API_URL}/markets?${params.toString()}`);
};

const fetchCoinsHistory = async (
  coinId: string,
  currency: string,
  days: number
) => {
  const params = new URLSearchParams({
    vs_currency: currency,
    days: String(days),
  });
  return await axios.get(
    `${API_URL}/${coinId}/market_chart?${params.toString()}`
  );
};

const currencyOptions = [
  { value: 'eur', label: 'EUR' },
  { value: 'usd', label: 'USD' },
];

const orderOptions = [
  { value: 'market_cap_desc', label: 'Market cap descending' },
  { value: 'market_cap_asc', label: 'Market cap ascending' },
];

const tableColumns = (
  currency: string,
  onOpenCoin: (index: number) => void
): ColumnsType<DataType> => {
  return [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, record: DataType) => (
        <Flex gap="16px" align="center">
          <Image width={32} src={record.image} />
          <span>{record.name}</span>
        </Flex>
      ),
    },
    {
      title: 'Current Price',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (_, record: DataType) => (
        <Flex gap="4px" align="center">
          <span>{record.current_price}</span>
          <span>{currency}</span>
        </Flex>
      ),
    },
    {
      title: 'Circulating Supply',
      dataIndex: 'circulating_supply',
      key: 'circulating_supply',
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, __, index) => (
        <EllipsisOutlined
          style={{ fontSize: '32px' }}
          onClick={() => onOpenCoin(index)}
        />
      ),
    },
  ];
};

const modalTabsItems = [
  { label: 'Overview', key: '0' },
  { label: 'Prices', key: '1' },
  { label: 'Market Caps', key: '2' },
  { label: 'Total Volumes', key: '3' },
];

function App() {
  const [page, setPage] = useState<number>(1);
  const [currency, setCurrency] = useState<string>('usd');
  const [order, setOrder] = useState<string>('market_cap_desc');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [perPage, setPerPage] = useState<number>(10);
  const [coinsMarketData, setCoinsMarketData] = useState<DataType[]>([]);
  const [openCoinIndex, setOpenCoinIndex] = useState<number>(-1);
  const [currentModalTab, setCurrentModalTab] = useState<string>('0');
  const [openCoinHistory, setOpenCoinHistory] = useState<HistoryDataType>({
    prices: [],
    market_caps: [],
    total_volumes: [],
  });
  const historyDays = 30;

  const handleCurrencyChange = (value: string) => setCurrency(value);
  const handleOrderChange = (value: string) => setOrder(value);
  const handleOpenCoin = (index: number) => setOpenCoinIndex(index);
  const handleCloseCoin = () => {
    setOpenCoinIndex(-1);
    setCurrentModalTab('0');
  };
  const handlePaginationChange: PaginationProps['onChange'] = (
    page,
    pageSize
  ) => {
    setPage(page);
    setPerPage(pageSize);
  };
  const handleModalTabsChange = (activeKey: string) =>
    setCurrentModalTab(activeKey);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchCoinsMarkets(
          currency,
          order,
          perPage,
          page
        );
        setCoinsMarketData(data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [currency, order, perPage, page]);

  const currentOpenCoin: DataType = useMemo(
    () => coinsMarketData[openCoinIndex],
    [coinsMarketData, openCoinIndex]
  );

  useEffect(() => {
    if (!currentOpenCoin) return;

    const fetchData = async () => {
      try {
        const { data } = await fetchCoinsHistory(
          currentOpenCoin.id,
          currency,
          historyDays
        );
        setOpenCoinHistory(data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [currency, historyDays, currentOpenCoin]);

  const currentCoinHistory = useMemo(() => {
    let currentGraph: Array<Array<number>> = [];
    if (currentModalTab === '1') currentGraph = openCoinHistory.prices;
    if (currentModalTab === '2') currentGraph = openCoinHistory.market_caps;
    if (currentModalTab === '3') currentGraph = openCoinHistory.total_volumes;
    if (!currentGraph) return null;

    const result = currentGraph.map(([date, value]) => ({
      date: new Date(date).toLocaleString(),
      value,
    }));
    return result;
  }, [currentModalTab, openCoinHistory]);

  return (
    <Flex vertical align="stretch" gap="24px">
      <Title
        style={{
          textAlign: 'left',
        }}
      >
        Coins & Markets
      </Title>
      <Flex gap="24px">
        <Select
          defaultValue="usd"
          options={currencyOptions}
          onChange={handleCurrencyChange}
          style={{ width: '200px', textAlign: 'left' }}
        />
        <Select
          defaultValue="market_cap_desc"
          options={orderOptions}
          onChange={handleOrderChange}
          style={{ width: '200px', textAlign: 'left' }}
        />
      </Flex>
      <Table
        columns={tableColumns(currency, handleOpenCoin)}
        dataSource={coinsMarketData}
        loading={isLoading}
        pagination={false}
      />
      <Pagination
        showSizeChanger
        onChange={handlePaginationChange}
        defaultCurrent={page}
        total={10000}
        style={{ alignSelf: 'self-end' }}
      />
      {openCoinIndex !== -1 && (
        <Modal
          width="1200px"
          open={openCoinIndex !== -1}
          title="Coin Details"
          onCancel={handleCloseCoin}
          footer={null}
        >
          <Flex vertical gap="24px">
            <Flex gap="16px" align="center">
              <Image width={100} src={currentOpenCoin.image} />
              <Title
                style={{
                  textAlign: 'left',
                }}
              >
                {currentOpenCoin.name}
              </Title>
            </Flex>
            <Tabs
              activeKey={currentModalTab}
              type="card"
              size="large"
              items={modalTabsItems}
              onChange={handleModalTabsChange}
            />
            {currentModalTab === '0' && (
              <>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Current Price"
                      value={currentOpenCoin.current_price}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Market Cap"
                      value={currentOpenCoin.market_cap}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Market Cap Rank"
                      value={currentOpenCoin.market_cap_rank}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Total Volume"
                      value={currentOpenCoin.total_volume}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="High 24 Hours"
                      value={currentOpenCoin.high_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Low 24 Hours"
                      value={currentOpenCoin.low_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Price Change 24 Hours"
                      value={currentOpenCoin.price_change_24h}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Price Change 24 Hours"
                      value={currentOpenCoin.price_change_percentage_24h}
                      suffix="%"
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High"
                      value={currentOpenCoin.ath}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High Date"
                      value={new Date(currentOpenCoin.ath_date).toDateString()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time High Change"
                      value={currentOpenCoin.ath_change_percentage}
                      suffix="%"
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Total Supply"
                      value={currentOpenCoin.total_supply}
                    />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low"
                      value={currentOpenCoin.atl}
                      suffix={currency.toUpperCase()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low Date"
                      value={new Date(currentOpenCoin.atl_date).toDateString()}
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="All Time Low Change"
                      value={currentOpenCoin.atl_change_percentage}
                      suffix="%"
                    />
                  </Col>
                  <Col className="gutter-row" span={6}>
                    <Statistic
                      title="Max Supply"
                      value={currentOpenCoin.max_supply}
                    />
                  </Col>
                </Row>
              </>
            )}
            {currentCoinHistory && currentModalTab !== '0' && (
              <>
                <Title level={4} style={{ margin: 0 }}>
                  Time Interval - last 30 days
                </Title>
                <LineChart
                  width={1000}
                  height={500}
                  data={currentCoinHistory}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 100,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </>
            )}
          </Flex>
        </Modal>
      )}
      <Title
        style={{
          textAlign: 'left',
        }}
      >
        App Source Code
      </Title>
      <CodeMirror
        value={codeMirrorValue}
        extensions={[javascript({ jsx: true })]}
      />
    </Flex>
  );
}

export default App;
