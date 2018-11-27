from aip import AipNlp

class Sa_aip():
    def __init__(self):
        """ 你的 APPID AK SK """
        app_id = "11484935"
        api_key = "DY0Rr1zKjaRmK1SiEWcUSUC4"
        secret_key = "DSIxiW47wKWoeYQc0alxHiE350VtMhPs"

        self.client = AipNlp(app_id, api_key, secret_key)

    def sa_for_title(self, title_list):
        """ input a list of news title, return a list of sentiment polarity of each title """
        polarity_list = []
        for title in title_list:
            result = self.client.sentimentClassify(title)
            if 'items' not in result:
                print('aip error:', title)
                polarity = 1
            else:
                polarity = result["items"][0]["sentiment"] #0:负向，1:中性，2:正向
            polarity_list.append(polarity)
        return polarity_list


def main():
    """ Main function. """
    query = ['今天天氣很好']

    sa_aip = Sa_aip()
    res = sa_aip.sa_for_title(query)
    print(res)

if __name__ == '__main__':
    main()
