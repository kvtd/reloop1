const allProducts = [
    {
        "id": 1,
        "name": "เสื้อยืด Hello Kitty ขอบแดง",
        "category": "Vintage",
        "price": 250,
        "oldPrice": null,
        "image": "images/product-shirt-1.jpg",
        "type": "shirt",
        "tag": "Rare"
    },
    {
        "id": 2,
        "name": "สายเดี่ยวลูกไม้สีชมพู",
        "category": "Coquette",
        "price": 290,
        "oldPrice": null,
        "image": "images/product-shirt-2.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 3,
        "name": "เสื้อเชิ้ตขาวผูกโบว์",
        "category": "Minimal",
        "price": 250,
        "oldPrice": 550,
        "image": "images/product-shirt-3.jpg",
        "type": "shirt",
        "tag": "-10%"
    },
    {
        "id": 4,
        "name": "เสื้อลายดอกวินเทจ",
        "category": "Y2K",
        "price": 190,
        "oldPrice": null,
        "image": "images/product-shirt-4.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 5,
        "name": "เสื้อลูกไม้ระบายชั้น",
        "category": "Fairy",
        "price": 220,
        "oldPrice": null,
        "image": "images/product-shirt-5.jpg",
        "type": "shirt",
        "tag": "New"
    },
    {
        "id": 6,
        "name": "เสื้อลายสก๊อตแต่งลูกไม้",
        "category": "Vintage",
        "price": 220,
        "oldPrice": null,
        "image": "images/product-shirt-6.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 7,
        "name": "เสื้อยืด Converse สีแดง",
        "category": "Streetwear",
        "price": 190,
        "oldPrice": null,
        "image": "images/product-shirt-7.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 8,
        "name": "เสื้อยืดลาย Hello Kitty",
        "category": "Character",
        "price": 250,
        "oldPrice": null,
        "image": "images/product-shirt-8.jpg",
        "type": "shirt",
        "tag": "Rare"
    },
    {
        "id": 9,
        "name": "เสื้อลายจุดคอวี",
        "category": "Vintage",
        "price": 200,
        "oldPrice": null,
        "image": "images/product-shirt-9.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 10,
        "name": "สายเดี่ยวลายสก๊อต",
        "category": "Casual",
        "price": 180,
        "oldPrice": null,
        "image": "images/product-shirt-10.jpg",
        "type": "shirt",
        "tag": null
    },
    {
        "id": 11,
        "name": "กางเกงขาสั้นลายสก๊อตฟ้า",
        "category": "Casual",
        "price": 150,
        "oldPrice": null,
        "image": "images/product-pant-1.jpg",
        "type": "pant",
        "tag": "New"
    },
    {
        "id": 12,
        "name": "ยีนส์ขายาวสีอ่อน",
        "category": "Denim",
        "price": 350,
        "oldPrice": null,
        "image": "images/product-pant-2.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 13,
        "name": "กางเกงคาร์โก้ขาสั้นสีดำ",
        "category": "Streetwear",
        "price": 220,
        "oldPrice": null,
        "image": "images/product-pant-3.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 14,
        "name": "กางเกงลายพราง",
        "category": "Streetwear",
        "price": 200,
        "oldPrice": 250,
        "image": "images/product-pant-4.jpg",
        "type": "pant",
        "tag": "-15%"
    },
    {
        "id": 15,
        "name": "กางเกงขาสั้นลายสก๊อตแดง",
        "category": "Vintage",
        "price": 180,
        "oldPrice": null,
        "image": "images/product-pant-5.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 16,
        "name": "กางเกงขาสั้นลายเสือ",
        "category": "Fashion",
        "price": 180,
        "oldPrice": null,
        "image": "images/product-pant-6.jpg",
        "type": "pant",
        "tag": "New"
    },
    {
        "id": 17,
        "name": "ยีนส์ขาม้าฟอกสี",
        "category": "Denim",
        "price": 390,
        "oldPrice": null,
        "image": "images/product-pant-7.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 18,
        "name": "ยีนส์ขาสั้นแต่งลูกไม้",
        "category": "Cute",
        "price": 200,
        "oldPrice": null,
        "image": "images/product-pant-8.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 19,
        "name": "ยีนส์ขาสั้นสีดำ",
        "category": "Basic",
        "price": 190,
        "oldPrice": null,
        "image": "images/product-pant-9.jpg",
        "type": "pant",
        "tag": null
    },
    {
        "id": 20,
        "name": "ยีนส์ขาสั้นแต่งขาด",
        "category": "Denim",
        "price": 220,
        "oldPrice": 250,
        "image": "images/product-pant-10.jpg",
        "type": "pant",
        "tag": "-10%"
    },
    {
        "id": 21,
        "name": "รองเท้าโลฟเฟอร์สีน้ำตาล",
        "category": "Vintage",
        "price": 450,
        "oldPrice": null,
        "image": "images/product-shoe-1.jpg",
        "type": "shoe",
        "tag": null,
        "size": "38"
    },
    {
        "id": 22,
        "name": "รองเท้าผ้าใบ Puma สีเทา-ชมพู",
        "category": "Sport",
        "price": 650,
        "oldPrice": 1200,
        "image": "images/product-shoe-2.jpg",
        "type": "shoe",
        "tag": "Sale",
        "size": "39"
    },
    {
        "id": 23,
        "name": "รองเท้าแตะบุขน",
        "category": "Casual",
        "price": 290,
        "oldPrice": null,
        "image": "images/product-shoe-3.jpg",
        "type": "shoe",
        "tag": "New",
        "size": "37"
    },
    {
        "id": 24,
        "name": "รองเท้าคัทชูหนังสีดำ",
        "category": "Formal",
        "price": 550,
        "oldPrice": null,
        "image": "images/product-shoe-4.jpg",
        "type": "shoe",
        "tag": null,
        "size": "38"
    },
    {
        "id": 25,
        "name": "รองเท้าแพลตฟอร์ม Mary Jane",
        "category": "Fashion",
        "price": 790,
        "oldPrice": null,
        "image": "images/product-shoe-5.jpg",
        "type": "shoe",
        "tag": "Popular",
        "size": "39"
    },
    {
        "id": 26,
        "name": "รองเท้าแตะสายเพชร",
        "category": "Glam",
        "price": 350,
        "oldPrice": null,
        "image": "images/product-shoe-6.jpg",
        "type": "shoe",
        "tag": "New",
        "size": "38"
    },
    {
        "id": 27,
        "name": "รองเท้าผ้าใบสีเงินเมทัลลิค",
        "category": "Streetwear",
        "price": 590,
        "oldPrice": null,
        "image": "images/product-shoe-7.jpg",
        "type": "shoe",
        "tag": null,
        "size": "39"
    },
    {
        "id": 28,
        "name": "รองเท้าคัทชูสีฟ้าพาสเทล",
        "category": "Cute",
        "price": 290,
        "oldPrice": null,
        "image": "images/product-shoe-8.jpg",
        "type": "shoe",
        "tag": null,
        "size": "37"
    },
    {
        "id": 29,
        "name": "รองเท้า Mary Jane สีแดงเลือดหมู",
        "category": "Vintage",
        "price": 450,
        "oldPrice": 690,
        "image": "images/product-shoe-9.jpg",
        "type": "shoe",
        "tag": "Sale",
        "size": "38"
    },
    {
        "id": 30,
        "name": "รองเท้าแตะหนังกลับสีน้ำตาล",
        "category": "Casual",
        "price": 390,
        "oldPrice": null,
        "image": "images/product-shoe-10.jpg",
        "type": "shoe",
        "tag": "Popular",
        "size": "40"
    },
    {
        "id": 31,
        "name": "กระโปรงชีฟองลายกราฟิก",
        "category": "Vintage",
        "price": 250,
        "oldPrice": null,
        "image": "images/product-skirt-1.jpg",
        "type": "skirt",
        "tag": null
    },
    {
        "id": 32,
        "name": "กระโปรงเทนนิสลายทาง",
        "category": "Sport",
        "price": 290,
        "oldPrice": null,
        "image": "images/product-skirt-2.jpg",
        "type": "skirt",
        "tag": "New"
    },
    {
        "id": 33,
        "name": "กระโปรงสั้นลายดอกไม้",
        "category": "Cute",
        "price": 220,
        "oldPrice": null,
        "image": "images/product-skirt-3.jpg",
        "type": "skirt",
        "tag": null
    },
    {
        "id": 34,
        "name": "กระโปรงชั้นลูกไม้สีชมพู",
        "category": "Coquette",
        "price": 350,
        "oldPrice": 590,
        "image": "images/product-skirt-4.jpg",
        "type": "skirt",
        "tag": "Sale"
    },
    {
        "id": 35,
        "name": "กระโปรงลูกไม้สีขาว",
        "category": "Fairy",
        "price": 280,
        "oldPrice": null,
        "image": "images/product-skirt-5.jpg",
        "type": "skirt",
        "tag": null
    },
    {
        "id": 36,
        "name": "กระโปรงพลีทลายสก๊อตน้ำตาล",
        "category": "Vintage",
        "price": 250,
        "oldPrice": null,
        "image": "images/product-skirt-6.jpg",
        "type": "skirt",
        "tag": "New"
    },
    {
        "id": 37,
        "name": "กระโปรงยีนส์สั้นฟอกสี",
        "category": "Casual",
        "price": 220,
        "oldPrice": null,
        "image": "images/product-skirt-7.jpg",
        "type": "skirt",
        "tag": null
    },
    {
        "id": 38,
        "name": "กระโปรงดำแต่งโบว์ลูกไม้",
        "category": "Coquette",
        "price": 290,
        "oldPrice": null,
        "image": "images/product-skirt-8.jpg",
        "type": "skirt",
        "tag": "Popular"
    },
    {
        "id": 39,
        "name": "กระโปรงชั้นลายสก๊อตชมพู",
        "category": "Y2K",
        "price": 280,
        "oldPrice": null,
        "image": "images/product-skirt-9.jpg",
        "type": "skirt",
        "tag": null
    },
    {
        "id": 40,
        "name": "กระโปรงหนังสีดำผ่าหน้า",
        "category": "Streetwear",
        "price": 320,
        "oldPrice": 450,
        "image": "images/product-skirt-10.jpg",
        "type": "skirt",
        "tag": "Sale"
    },
    {
        "id": 41,
        "name": "กระเป๋าผ้าใบ BAPE x Stussy",
        "category": "Streetwear",
        "price": 590,
        "oldPrice": null,
        "image": "images/product-bag-1.jpg",
        "type": "bag",
        "tag": "Rare"
    },
    {
        "id": 42,
        "name": "กระเป๋าสะพายไหล่แต่งเข็มขัด",
        "category": "Y2K",
        "price": 450,
        "oldPrice": null,
        "image": "images/product-bag-2.jpg",
        "type": "bag",
        "tag": "New"
    },
    {
        "id": 43,
        "name": "กระเป๋าหนังแท้ทรง Hobo",
        "category": "Vintage",
        "price": 890,
        "oldPrice": 1200,
        "image": "images/product-bag-3.jpg",
        "type": "bag",
        "tag": "Sale"
    },
    {
        "id": 44,
        "name": "เป้ลายสก๊อตแต่งลูกไม้",
        "category": "Mori Girl",
        "price": 390,
        "oldPrice": null,
        "image": "images/product-bag-4.jpg",
        "type": "bag",
        "tag": "Cute"
    },
    {
        "id": 45,
        "name": "กระเป๋าถือลายเสือ",
        "category": "Fashion",
        "price": 350,
        "oldPrice": null,
        "image": "images/product-bag-5.jpg",
        "type": "bag",
        "tag": null
    },
    {
        "id": 46,
        "name": "กระเป๋าสะพายไหล่สีดำเงา",
        "category": "Y2K",
        "price": 490,
        "oldPrice": null,
        "image": "images/product-bag-6.jpg",
        "type": "bag",
        "tag": "New"
    },
    {
        "id": 47,
        "name": "กระเป๋าสะพายสีขาวแต่งเข็มขัด",
        "category": "Y2K",
        "price": 550,
        "oldPrice": null,
        "image": "images/product-bag-7.jpg",
        "type": "bag",
        "tag": "Popular"
    },
    {
        "id": 48,
        "name": "กระเป๋าถือสีฟ้าพาสเทล",
        "category": "Cute",
        "price": 390,
        "oldPrice": null,
        "image": "images/product-bag-8.jpg",
        "type": "bag",
        "tag": null
    },
    {
        "id": 49,
        "name": "กระเป๋ามินิสีชมพูลายหนังจระเข้",
        "category": "Fashion",
        "price": 350,
        "oldPrice": 590,
        "image": "images/product-bag-9.jpg",
        "type": "bag",
        "tag": "Sale"
    },
    {
        "id": 50,
        "name": "กระเป๋าหนังวินเทจสีน้ำตาล",
        "category": "Vintage",
        "price": 690,
        "oldPrice": null,
        "image": "images/product-bag-10.jpg",
        "type": "bag",
        "tag": "Rare"
    }
];
