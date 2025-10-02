import { signOut } from "@/auth";

export const ja = {
  nav: {
    intro: "トップ",
    greeting: "ご挨拶",
    profile: "プロフィール",
    dresscode: "ドレスコード",
    rsvp: "出欠登録",
    access: "アクセス",
    gallery: "ギャラリー",
    gift: "ご祝儀",
  },
  hero: {
    title: "結婚式のご招待",
    subtitle: "藤岡家・和田家 結婚披露宴",
    date: "2025年12月13日(土)",
    time: "午前10時30分 挙式開始",
    venue: "パークサイドハウス 大阪梅田",
    greeting: `謹啓

    皆様いかがお過ごしでしょうか

    このたび私たちは
    結婚式を挙げることとなりました

    日頃お世話になっております皆様に
    私どもの門出を見守っていただきたく
    ささやかながら小宴を行いたいと思います

    ご多用中　誠に恐縮ではございますが
    ぜひご出席いただきたく
    ご案内申し上げます

    謹白`,
  },
  cta: {
    rsvp: "出欠登録",
  },
  countdown: {
    days: "日",
    hours: "時間",
    minutes: "分",
    seconds: "秒",
  },
  profile: {
    title: "プロフィール",
    firstImpression: { title: "相手の第一印象" },
    groom: {
      name: "新郎 藤岡拓人",
      message:
        "結婚前から尻に敷かれてます",
      firstImpression: "やっぱマスク無いほうが可愛いやん",
      alt: "新郎の写真",
    },

    bride: {
      name: "新婦 和田ひなの",
      message:
        "藤岡家の影の大黒柱",
      firstImpression: "ガタイがいい！かっこいい！",
      alt: "新婦の写真",
    },
  },
  dresscode: {
    title: "ドレスコード",
    subtitle: `華やかな色彩で彩られた
    結婚式を心に描いております 
    ぜひ色とりどりの
    お召し物でお越しいただき 
    会場をさらに鮮やかに
    彩っていただけると幸いです
    `,
    point: {
      ok: "推奨スタイルのポイント",
      ng: "NGスタイルのポイント"
    },
    ok: {
      title: "推奨スタイル",
      memos: [
        "明るく華やかな色のお洋服",
        `季節を感じる
      彩りコーディネート`,
        `会場を彩る
      カラフルなワンポイント`,
      ],
      alt: "推奨ドレスコード例",
    },
    ng: {
      title: "NGスタイル",
      memos: [
        `黒すぎて
        写真で埋もれてしまう服`,
        "ヨレヨレのTシャツ",
        `参考写真のぷん太のような
        やる気ゼロ感`,
      ],
      alt: "NGドレスコード例",
    },
  },
  rsvp: {
    title: "ご出欠のご返信",
    subtitle: {
      default: "フォームに必要事項をご入力ください",
      named: "{{name}} 様のご出欠について、フォームに必要事項をご入力ください",
    },
    used: {
      badge: "このリンクは使用済みです",
      title: {
        default: "この招待リンクはすでに使用されています",
        named: "{{name}} 様、この招待リンクはすでに使用されています",
      },
      description: "お手数ですが、主催者までご連絡ください。確認の上、ご案内いたします。",
      contact: "主催者に連絡する",
    },
    error: {
      title: "無効な招待リンクです",
      description: "リンクが間違っているか、有効期限切れの可能性があります。",
      missingTitle: "招待リンクが見つかりません",
      contact: "主催者に連絡する",
    },
    form: {
      firstname: "名",
      lastname: "姓",
      email: "メールアドレス",
      phone: "電話番号",
      // ★ 追加
      birthdate: "生年月日",

      attendance: "出欠",
      attend: "出席",
      decline: "欠席",
      submit: "送信する",
      submitting: "送信中...",

      steps: {
        basic: "基本情報",
        attendance: "同伴者情報",
        health: "アレルギー情報",
        confirm: "確認",
      },

      companions: {
        label: "同伴者",
        add: "同伴者を追加",
        firstnamePlaceholder: "名",
        lastnamePlaceholder: "姓",
        emailPlaceholder: "メールアドレス",
        phonePlaceholder: "電話番号",
        // ★ 追加
        birthdatePlaceholder: "生年月日",
        remove: "削除",
        noCompanions: "同伴者は未追加です",
        companionNumber: "同伴者",
      },

      health: {
        dogAllergy: "犬アレルギーはありますか？",
        foodAllergy: "食物アレルギー",
        foodAllergyPlaceholder: "その他（入力して Enter）",
        commonAllergens: "よくあるアレルギー",
        add: "追加",
        close: "閉じる",
        yes: "あり",
        no: "なし",
      },

      confirmation: {
        mainGuest: "代表者",
        companionGuest: "同伴者",
        name: "お名前",
        email: "メール：",
        phone: "電話：",
        attendance: "出欠：",
        allergy: "アレルギー：",
        // ★ 追加
        birthdate: "生年月日",
      },

      navigation: {
        back: "戻る",
        next: "次へ",
        checking: "確認中…",
      },

      error: {
        duplicateMain:
          "すでに登録済みの方が見つかりました（同姓・同名・生年月日が一致）。内容をご確認ください。",
        duplicateCompanions:
          "同伴者の中に既に登録済みの方が見つかりました：{{names}}",
        submitFailed: "送信に失敗しました。時間をおいて再度お試しください。",
      },

      validation: {
        selectAttendance: "出欠を選択してください",
        requiredFields: "必須項目を入力してください",
        // ★ 追加（Zodエラーと整合）
        birthdateRequired: "生年月日は必須です",
        birthdateInvalidFormat: "日付の形式は YYYY-MM-DD で入力してください",
        birthdateFuture: "生年月日が未来日です",
        invalidEmail: "メールアドレスの形式が正しくありません。",
        invalidPhone: "電話番号の形式が正しくありません。",
        requiredLastName: "姓は必須です。",
        requiredFirstName: "名は必須です。",
        requiredBirthdate: "生年月日は必須です。",
      },
    },
  },
  gift: {
    title: "ご祝儀について",
    subtitle1: "ご祝儀は事前振り込みにてお願い申し上げます",
    subtitle2: "当日の現金でのお持ち込みは不要でございます",
    transfer: {
      title: "振込先",
      accounts: {
        bankName: "SBI新生銀行",
        branchName: "さくら支店",
        branchCode: "(300)",
        accountType: "普通",
        accountNumber: "3644081",
        accountHolder: "藤岡拓人",
      },
    },
    deadline: {
      note1: "※お振込みは11月30日(日)までに",
      note2: "お願いいたします",
    }
  },
  access: {
    title: "アクセス",
    subtitle: "会場へのアクセス方法をご案内いたします",
    venue: {
      name: "パークサイドハウス 大阪梅田",
      address: "〒531-6101 大阪市北区大淀中1-8-30",
    },
    parking: {
      title: "駐車場について",
      notice: `※ 駐車場はございません
      公共交通機関をご利用ください`,
    },
    tabs: {
      title: "最寄駅からのアクセス",
      walk: "徒歩",
      taxi: "タクシー",
    },
    walkAccess: {
      description: `JR大阪駅北口もしくは
      大阪梅田駅茶屋町口より徒歩13分(900m)`,
      details: [
        `JR大阪駅北口を出て
        梅田スカイビル方向へ`,
        `大阪梅田駅茶屋町口からも同様のルート`,
        "距離: 約900m　所要時間: 約13分",
      ],
      duration: "13分"
    },
    taxiAccess: {
      description: `JR大阪駅もしくは
      大阪梅田駅からタクシーで約6分`,
      details: [
        `JR大阪駅 桜橋口
        タクシー乗り場から乗車`,
        `大阪梅田駅
        タクシー乗り場からも利用可能`,
        "料金: 約800円　所要時間: 約6分",
      ],
      duration: "6分",
      fare: "800円"
    },
    eventCard: {
      title: "当日の詳細",
      date: "日時: 2025年12月13日(土)午前10時30分〜",
      reception: "受付: 午前9時30分 ~ 午前10時00分",
      contact: "式場連絡先: 06-6458-0081",
      addToCalendar: "カレンダーに追加",
      share: "共有",
    },
  },
  gallery: {
    title: "ギャラリー",
    subtitle: "私たちの思い出の写真をご覧ください♪",
    tap: "(タップで画像を拡大できます)",
    images: [
      `エアビーでピザパ 
      in Canada`,
      `シアトルの
      クラムチャウダー`,
      `バンクーバーの
      Denny's`,
      `オバマ元大統領も愛した
      ドーナツ`,
      `BCITを卒業しました(嘘)`,
      `シアトルのガムウォール`,
      `シアトルでハンバーガー`,
      `ウェディングフォト`,
      `Public Market in シアトル`,
      `募金箱のレイチェル`,
      `スタバ1号店`,
      `ワシントン大学`,
      `かわいい〜`,
      `ももとひな`,
      `幼少期の拓人`,
      `万博行ったよ`,
      `クリスマスマーケット
      in 天王寺`,
      `2回目?のデート
      in 淡路島`,
      `初めてのツーショット`,
      `ドラクエウォークの
      イベントのために富士急へ`,
      `ドラクエウォークの
      イベントのために奈良へ
      (Part1)`,
      `ドラクエウォークの
      イベントのために奈良へ
      (Part2)`,
      `お花見🌸`,
      `白黒やとテカっちゃう`,
    ],
    lightbox: {
      close: "閉じる",
      prev: "前の画像",
      next: "次の画像",
    },
  },
  footer: {
    title: `皆様にお会いできるのを
    心待ちにしています
    `,
    message: `ご予定の変更により出欠が変わる場合は
    お手数ですが直接ご連絡ください`,
    copyright: "© 2025 Tatsunori & Momona. All rights reserved.",
  },
  meta: {
    title: "藤岡家・和田家結婚披露宴招待状",
    description:
      "私たちの特別な日にお越しいただけることを心よりお待ちしております",
  },
  common: {
    loading: "読み込み中...",
  },
  admin: {
    title: "管理者ページ",
    description: "招待状の管理と参加者情報の確認",
    tabs: {
      tokens: "招待トークン管理",
      guests: "参加者一覧",
      admins: "管理者",
    },
    stats: {
      totalInvites: "総招待数",
      attendees: "出席者",
      decliners: "欠席者",
      responseRate: "回答率",
    },
    tokens: {
      title: "招待トークン一覧",
      description: "ゲスト用の招待URLを管理できます",
      createButton: "新規作成",
      creating: "作成中...",
      createTitle: "新しい招待トークンを作成",
      inviteeName: "招待者名",
      inviteeNamePlaceholder: "例: 田中太郎様",
      successTitle: "トークンが作成されました！",
      inviteUrl: "招待URL:",
      copyUrlButton: "URLをコピー",
      table: {
        inviteeName: "招待者名",
        token: "トークン",
        createdAt: "作成日",
        status: "使用状況",
        action: "アクション",
        used: "使用済み",
        unused: "未使用",
        copyUrl: "URLコピー",
        delete: "削除",
        copiedToClipboard: "招待URLをクリップボードにコピーしました",
      },
    },
    guests: {
      title: "参加者一覧",
      description: "出欠登録済みのゲスト情報を確認できます",
      exportButton: "エクセル出力",
      editButton: "編集",
      table: {
        name: "名前",
        contact: "連絡先",
        attendance: "出欠",
        allergies: "アレルギー",
        birthdate: "生年月日",
        registeredAt: "登録日時",
        actions: "操作",
        attend: "出席",
        decline: "欠席",
        none: "なし",
        notRegistered: "未登録",
        email: "Email",
        phone: "電話番号",
      },
      editDialog: {
        title: "ゲスト情報を編集",
        save: "保存",
        cancel: "キャンセル",
        success: "更新しました",
      },
    },
    allowlist: {
      addLabel: "管理者メールを追加",
      listTitle: "許可されている管理者",
      note: "Gmailはドットと+エイリアスを無視して同一判定します。",
    },
    common: {
      cancel: "キャンセル",
      complete: "完了",
      add: "追加",
      added: "追加しました。",
      remove: "削除",
      removed: "削除しました。",
      none: "ありません",
      signOut: "サインアウト",
    },
  },
  thankYou: {
    title: "ご回答ありがとうございます",
    imageAlt: "RSVP 完了イメージ",
    badge: "RSVP 完了",
    titleNamed: "{{name}} 様、ありがとうございます",
    titleDefault: "ありがとうございます",
    descriptionAttend:
      "ご出席のご連絡をいただき、心より感謝申し上げます。当日お会いできるのを楽しみにしています。",
    descriptionDecline:
      "ご欠席のご連絡をいただき、感謝申し上げます。あたたかいお気持ち、確かに受け取りました。",
    descriptionGeneric: "ご回答に感謝いたします。内容を受け付けました。",
    changeNote:
      "内容の変更をご希望の際は、お手数ですが上の「問い合わせる」よりご連絡ください。",
    actions: { contact: "問い合わせる" },
  },
} as const;
