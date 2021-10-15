function Word2vec(embedding, size) {
    this.embedding = embedding
    this.size = size
}

Word2vec.prototype.Dot = function(a, b) {
    let dot = 0

    for (let i = 0; i < this.size; i++)
        dot += a[i] * b[i]

    return dot
}

Word2vec.prototype.Similarity = function(a, b) {
    return this.Dot(a, b)
}

Word2vec.prototype.Combination = function(words, weights) {
    let v = new Array(this.size).fill(0)

    for (let i = 0; i < words.length; i++) {
        let vector = this.embedding[words[i]]

        if (vector == undefined) {
            console.log('word "' + words[i] + '" was skipped')
            continue
        }

        for (let j = 0; j < this.size; j++)
            v[j] += vector[j] * weights[i]
    }

    let len = Math.sqrt(this.Dot(v, v))

    if (len > 0) {
        for (let i = 0; i < this.size; i++) {
            v[i] /= len
        }
    }

    return v
}

Word2vec.prototype.GetTopWords = function(v, count = 10) {
    let words = this.PartialSort(Object.keys(this.embedding), count, (a, b) => { return this.Similarity(v, this.embedding[b]) - this.Similarity(v, this.embedding[a])})
    let result = []

    for (let i = 0; i < count; i++) {
        let similarity = this.Similarity(v, this.embedding[words[i]])
        result.push({ word: words[i], similarity: Math.round(similarity * 1000) / 1000 })
    }

    return result
}

Word2vec.prototype.GetTopWordsCombination = function(words, weights, count = 10) {
    return this.GetTopWords(this.Combination(words, weights), count)
}

Word2vec.prototype.Bisect = function(items, x, comparator, lo, hi) {
    if (typeof(lo) == 'undefined')
        lo = 0

    if (typeof(hi) == 'undefined')
        hi = items.length

    while (lo < hi) {
        let mid = Math.floor((lo + hi) / 2)

        if (comparator(x, items[mid]) < 0) {
            hi = mid
        }
        else {
            lo = mid + 1
        }
    }

    return lo;
}

Word2vec.prototype.PartialSort = function(items, k, comparator) {
    let smallest = []

    for (let i = 0, len = items.length; i < len; ++i) {
        let item = items[i]

        if (smallest.length < k || comparator(item, smallest[smallest.length - 1]) < 0) {
            smallest.splice(this.Bisect(smallest, item, comparator), 0, item)

            if (smallest.length > k) {
                smallest.splice(k, 1)
            }
        }
    }

    return smallest
}
