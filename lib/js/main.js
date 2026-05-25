let csvSeatList = [];

/*
  =====================
  列解析
  =====================
*/
function parseRow(str) {

  const match = str.match(
    /^([A-Z]+)-(\d+)$/i
  );

  if (!match) {

    alert(
      '列は A-1 の形式で入力してください'
    );

    return null;
  }

  return {

    letter:
      match[1].toUpperCase(),

    number:
      parseInt(match[2])
  };
}

/*
  =====================
  ページ作成
  =====================
*/
function createPage() {

  const page =
    document.createElement('div');

  page.className = 'page';

  document
    .getElementById('pages')
    .appendChild(page);

  return page;
}

/*
  =====================
  席番生成
  =====================
*/
function createSeatCard(
  rowName,
  seat,
  targetPage
) {

  /*
    フォントサイズ取得
  */
  const rowFontSize =
    document.getElementById(
      'rowFontSize'
    ).value || 22;

  const seatFontSize =
    document.getElementById(
      'seatFontSize'
    ).value || 72;

  const suffixFontSize =
    document.getElementById(
      'suffixFontSize'
    ).value || 28;

  /*
    色取得
  */
  const color =
    document.getElementById(
      'colorSelect'
    ).value;

  const card =
    document.createElement('div');

  card.className = 'seat-card';

  card.innerHTML = `
    <div
      class="row-label"
      style="
        font-size:${rowFontSize}px;
        color:${color};
      "
    >
      ${rowName} 列
    </div>

    <div class="number-wrap">

      <div
        class="seat-number"
        style="
          font-size:${seatFontSize}px;
          color:${color};
        "
      >
        ${seat}
      </div>

      <div
        class="seat-suffix"
        style="
          font-size:${suffixFontSize}px;
          color:${color};
        "
      >
        番
      </div>

    </div>
  `;

  targetPage.appendChild(card);
}

/*
  =====================
  メイン生成
  =====================
*/
function generateSeats() {

  const container =
    document.getElementById(
      'pages'
    );

  container.innerHTML = '';

  const MAX_PER_PAGE = 10;

  let seatList = [];

  /*
    =====================
    CSVファイル確認
    =====================
  */
  const csvFile =
    document.getElementById(
      'csvFile'
    ).files[0];

  /*
    =====================
    CSV優先
    =====================
  */
  if (
    csvFile &&
    csvSeatList.length > 0
  ) {

    console.log(
      'CSV MODE'
    );

    seatList = [...csvSeatList];

  } else {

    /*
      =====================
      再印刷モード
      =====================
    */
    const reprintMode =
      document
        .getElementById(
          'reprintMode'
        )
        .checked;

    /*
      =====================
      再印刷席のみ
      =====================
    */
    if (reprintMode) {

      const reprintText =
        document
          .getElementById(
            'reprintSeats'
          )
          .value
          .trim();

      if (!reprintText) {

        alert(
          '再印刷席を入力してください'
        );

        return;
      }

      const lines =
        reprintText
          .split('\n')
          .map(v => v.trim())
          .filter(v => v);

      lines.forEach(line => {

        /*
          A-1,3
        */
        const cols =
          line.split(',');

        if (cols.length < 2)
          return;

        seatList.push({

          rowName:
            cols[0].trim(),

          seat:
            cols[1].trim()
        });
      });

    } else {

      /*
        =====================
        通常生成
        =====================
      */

      const startRowValue =
        document
          .getElementById(
            'startRow'
          )
          .value
          .trim();

      const endRowValue =
        document
          .getElementById(
            'endRow'
          )
          .value
          .trim();

      if (
        !startRowValue ||
        !endRowValue
      ) {

        alert(
          '開始列・終了列を入力してください'
        );

        return;
      }

      const startRow =
        parseRow(startRowValue);

      const endRow =
        parseRow(endRowValue);

      if (
        !startRow ||
        !endRow
      ) return;

      const startNum =
        parseInt(
          document
            .getElementById(
              'startNum'
            )
            .value
        );

      const endNum =
        parseInt(
          document
            .getElementById(
              'endNum'
            )
            .value
        );

      if (
        isNaN(startNum) ||
        isNaN(endNum)
      ) {

        alert(
          '開始番号・終了番号を入力してください'
        );

        return;
      }

      for (
        let rowNum =
          startRow.number;
        rowNum <=
          endRow.number;
        rowNum++
      ) {

        const rowName =
          `${startRow.letter}-${rowNum}`;

        for (
          let seat =
            startNum;
          seat <= endNum;
          seat++
        ) {

          seatList.push({

            rowName,

            seat
          });
        }
      }
    }
  }

  /*
    =====================
    出力対象なし
    =====================
  */
  if (
    seatList.length === 0
  ) {

    alert(
      '出力対象の席がありません'
    );

    return;
  }

  /*
    =====================
    描画
    =====================
  */
  let currentCount = 0;

  let currentPage =
    createPage();

  seatList.forEach(item => {

    if (
      currentCount >=
      MAX_PER_PAGE
    ) {

      currentPage =
        createPage();

      currentCount = 0;
    }

    createSeatCard(
      item.rowName,
      item.seat,
      currentPage
    );

    currentCount++;
  });
}

/*
  =====================
  CSV読み込み
  =====================
*/
document
  .getElementById('csvFile')
  .addEventListener(
    'change',
    function(event) {

      const file =
        event.target.files[0];

      /*
        CSV解除
      */
      if (!file) {

        csvSeatList = [];

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        function(e) {

          /*
            BOM除去
          */
          const text =
            e.target.result.replace(
              /^\uFEFF/,
              ''
            );

          const rows =
            text
              .split(/\r?\n/)
              .map(r => r.trim())
              .filter(r => r);

          console.log(
            'CSV ROWS:',
            rows
          );

          csvSeatList = [];

          rows.forEach(
            (line, index) => {

              /*
                ヘッダー除外
              */
              if (index === 0)
                return;

              /*
                カンマ or タブ
              */
              const cols =
                line.split(/,|\t/);

              const rowName =
                cols[0]
                  ? cols[0]
                      .replace(/"/g, '')
                      .trim()
                  : '';

              const seat =
                cols[1]
                  ? cols[1]
                      .replace(/"/g, '')
                      .trim()
                  : '';

              if (
                !rowName ||
                !seat
              ) {

                console.log(
                  'SKIP:',
                  line
                );

                return;
              }

              csvSeatList.push({

                rowName,

                seat
              });
            }
          );

          console.log(
            'CSV LIST:',
            csvSeatList
          );

          /*
            CSVデータなし
          */
          if (
            csvSeatList.length === 0
          ) {

            alert(
              'CSVを読み込めませんでした'
            );

            return;
          }

          /*
            自動生成
          */
          generateSeats();
        };

      reader.readAsText(
        file,
        'utf-8'
      );
    }
  );

/*
  =====================
  リアルタイム更新
  =====================
*/
document
  .querySelectorAll(
    '#rowFontSize, #seatFontSize, #suffixFontSize, #colorSelect'
  )
  .forEach(el => {

    el.addEventListener(
      'input',
      function() {

        const hasPages =
          document
            .getElementById(
              'pages'
            )
            .innerHTML
            .trim();

        if (hasPages) {

          generateSeats();
        }
      }
    );

  });

/*
  =====================
  PDF出力
  =====================
*/
async function downloadPDF() {

  const element =
    document.getElementById(
      'pages'
    );

  if (
    !element.innerHTML.trim()
  ) {

    alert(
      '先に席札を生成してください'
    );

    return;
  }

  document.body.classList.add(
    'pdf-mode'
  );

  const opt = {

    margin: 0,

    filename: '席番.pdf',

    image: {

      type: 'jpeg',

      quality: 1
    },

    html2canvas: {

      scale: 1.5,

      scrollX: 0,

      scrollY: 0
    },

    jsPDF: {

      unit: 'mm',

      format: 'a4',

      orientation: 'portrait'
    },

    pagebreak: {

      mode: ['avoid-all']
    }
  };

  await html2pdf()
    .set(opt)
    .from(element)
    .save();

  document.body.classList.remove(
    'pdf-mode'
  );
}