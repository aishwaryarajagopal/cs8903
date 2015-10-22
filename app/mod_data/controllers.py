
from py2neo import Graph, Path, Node, Relationship, neo4j
from flask import Blueprint, request, render_template, redirect, url_for
import gzip
import simplejson
import nltk
from nltk.collocations import *
from nltk.tokenize import word_tokenize
import datetime as dt1
import json, re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from datetime import date, datetime, timedelta
import sys, string, random, numpy
from llda import LLDA
from optparse import OptionParser
from nltk.corpus import reuters
import pymysql

conn = pymysql.connect(host='localhost', port=3306, user='root', passwd='', db='amazon3')
cur = conn.cursor()

stemmer = PorterStemmer()

mod_data = Blueprint('mod_data', __name__, url_prefix = '/data')

@mod_data.route('/index1.html')
def index1():
	return render_template('/mod_data/index1.html')

@mod_data.route('/loadCat')
def loadCat():
	return_string = {}
	
	# Fetch ctegories
	cats = []
	cur.execute("SELECT distinct category from topic_words")
	for row in cur:
		cats.append(row[0])
	return_string["categories"] = cats;

	# Initialize start and end dates
	start_dt =  '2012-01-01'
	end_dt =  '2013-01-10'
	
	#Fetch word date details for category
	wordString = []
	cur.execute("SELECT distinct topic from topic_date_detail where category = '"+cats[0]+"'")
	for topic in cur:
		print topic[0]
		cur1 = conn.cursor()
		cur1.execute("SELECT * from topic_date_detail where category = '"+cats[0]+"' and topic = '"+topic[0]+"' order by t_date")
		dtcArrPositive,dtcArrNegative,dtcArrWords1, dtcArrWords2 = {},{},{},{}
		newarrPositive,newarrNegative,newarrWords1, newarrWords2 = [],[],[],[]
		for row in cur1:
			dt = row[1].strftime('%Y-%m-%d')
			dtcArrPositive[dt] = row[2]
			dtcArrNegative[dt] = row[4]
			dtcArrWords1[dt] = row[3]
			dtcArrWords2[dt] = row[5]
	  	curdate = datetime.strptime(start_dt, "%Y-%m-%d")	
	  	last_date = datetime.strptime(end_dt, "%Y-%m-%d");
	  	while curdate < last_date:
	  		strpart = curdate.strftime('%Y-%m-%d')
	  		newarrPositive.append(dtcArrPositive.get(strpart, 0))
			newarrNegative.append(dtcArrNegative.get(strpart, 0))
			
			#Get frequency of positive words and return in the same order
			pos_words = str(dtcArrWords1.get(strpart, 0));
			pos_words = "'"+pos_words.replace(",", "','")+"'";
			cur2 = conn.cursor()
			cur2.execute("SELECT t_word, pos_count from topic_date_word_detail where category = '"+cats[0]+"' and t_date = '"+strpart+"' and t_word in ("+pos_words+") order by pos_count desc")
			pos_words = "";
			for rec in cur2:
				pos_words+=rec[0]+","
			cur2.close();
			pos_words = pos_words[:-1]
			newarrWords1.append(pos_words)

			#Get frequency of negative words and return in the same order
			neg_words = str(dtcArrWords2.get(strpart, 0));
			neg_words = "'"+neg_words.replace(",", "','")+"'";
			cur2 = conn.cursor()
			cur2.execute("SELECT t_word, neg_count from topic_date_word_detail where category = '"+cats[0]+"' and t_date = '"+strpart+"' and t_word in ("+neg_words+") order by neg_count desc")
			neg_words = "";
			for rec in cur2:
				neg_words+=rec[0]+","
			cur2.close();
			neg_words = neg_words[:-1]
			newarrWords2.append(neg_words)

	  		curdate = curdate + dt1.timedelta(days=1);
	  	pcount = numpy.sum(newarrPositive)
	  	ncount = numpy.sum(newarrNegative)
	  	wordString.append({
			"key": topic[0],
			"Positivevalues": newarrPositive,
			"Negativevalues": newarrNegative,
			"Words1": newarrWords1,
			"Words2": newarrWords2,
			"pcount": pcount,
			"ncount" : ncount
		})
	return_string["wordjson"]=wordString;
	return simplejson.dumps(return_string);

@mod_data.route('/loadTopics')
def loadTopics():
	#cats = request.args.get('category', '')
	cats = "Shoes"
	return_string = {}
	wordString = []
	topic_array, comment_array = [],[]
	cur.execute("SELECT distinct topic from topic_words where category = '"+cats+"'")
	for row in cur:
		topic_array.append(row[0])
	cur.execute("SELECT distinct comment_text from raw_comments limit 20")
	for row in cur:
		comment_array.append(row[0])
	return_string = {}
	return_string["comments"] = comment_array;
	return_string["topics"] = topic_array;
	return simplejson.dumps(return_string);

@mod_data.route('/loadWords')
def loadWords():
	cats = request.args.get('category', '')
	print cats
	return_string = {}

	# Initialize start and end dates
	start_dt = '2012-01-01'
	end_dt =  '2013-01-10'
	
	#Fetch word date details for category
	wordString = []
	cur.execute("SELECT distinct topic from topic_date_detail where category = '"+cats+"'")
	for topic in cur:
		print topic[0]
		cur1 = conn.cursor()
		cur1.execute("SELECT * from topic_date_detail where category = '"+cats+"' and topic = '"+topic[0]+"' order by t_date")
		dtcArrPositive,dtcArrNegative,dtcArrWords1, dtcArrWords2 = {},{},{},{}
		newarrPositive,newarrNegative,newarrWords1, newarrWords2 = [],[],[],[]
		for row in cur1:
			print row
			dt = row[1].strftime('%Y-%m-%d')
			dtcArrPositive[dt] = row[2]
			dtcArrNegative[dt] = row[4]
			dtcArrWords1[dt] = row[3]
			dtcArrWords2[dt] = row[5]
	  	curdate = datetime.strptime(start_dt, "%Y-%m-%d")	
	  	last_date = datetime.strptime(end_dt, "%Y-%m-%d");
	  	while curdate < last_date:
	  		strpart = curdate.strftime('%Y-%m-%d')
	  		newarrPositive.append(dtcArrPositive.get(strpart, 0))
			newarrNegative.append(dtcArrNegative.get(strpart, 0))
			newarrWords1.append(dtcArrWords1.get(strpart, 0))
			#Get frequency of words and return in the same order
			newarrWords2.append(dtcArrWords2.get(strpart, 0))
	  		curdate = curdate + dt1.timedelta(days=1);
	  	pcount = numpy.sum(newarrPositive)
	  	ncount = numpy.sum(newarrNegative)
	  	wordString.append({
			"key": topic[0],
			"Positivevalues": newarrPositive,
			"Negativevalues": newarrNegative,
			"Words1": newarrWords1,
			"Words2": newarrWords2,
			"pcount": pcount,
			"ncount" : ncount
		})
	return_string["wordjson"]=wordString;
	print wordString
	return simplejson.dumps(return_string);

@mod_data.route('/topic1')
def topic_mod1():
	##For creating a new topic
	word = request.args.get('word', '')
	topic = request.args.get('topic', '')
	cat = request.args.get('category', '')
	cur.execute("delete from topic_words where topic = '"+topic+"' and category = '"+cat+"' and word is null")
	cur.execute("INSERT INTO topic_words (category, topic, word, weight) VALUES ('"+cat+"', '"+topic+"','"+word+"', 0) ON DUPLICATE KEY UPDATE  weight=VALUES(weight)")
	topic_mod5();
	return "hello";

@mod_data.route('/topic2')
def topic_mod2():
	##For renaming an existing topic
	cats = request.args.get('category', '')
	old_topic = request.args.get('oldtopic', '')
	new_topic = request.args.get('newtopic', '')
	cur.execute("update topic_words set topic = '"+new_topic+"' where topic = '"+old_topic+"' and category = '"+cats+"'")
	return "hello"

@mod_data.route('/topic3')
def topic_mod3():
	##For removing an existing topic
	cats = request.args.get('category', '')
	old_topic = request.args.get('oldtopic', '')
	cur.execute("delete from topic_words where topic = '"+old_topic+"' and category = '"+cats+"'")
	return "hello"

@mod_data.route('/topic4')
def topic_mod4():
	##For fetching words from topics
	cats = request.args.get('category', '')
	result_set=[];
	topic_set = []
	cur.execute("SELECT distinct topic from topic_words where category = '"+cats+"'")
	for row in cur:
		topic_set.append(row[0])
	for topic in topic_set:
		record_json = {}
		record_json['topic'] = topic
		word_list = []
		cur.execute("SELECT * from topic_words where category = '"+cats+"' and topic = '"+topic+"'")		
		for row in cur:
			word_json = {}
			word_json['word'] = row[2]
			word_json['weight'] = row[3]
			word_list.append(word_json)
		record_json['words'] = word_list
		result_set.append(record_json)
	return simplejson.dumps(result_set);

@mod_data.route('/topic5')
def topic_mod5():
	##For fetching words from topics
	parser = OptionParser()
	parser.add_option("--alpha", dest="alpha", type="float", help="parameter alpha", default=0.001)
	parser.add_option("--beta", dest="beta", type="float", help="parameter beta", default=0.001)
	parser.add_option("-k", dest="K", type="int", help="number of topics", default=50)
	parser.add_option("-i", dest="iteration", type="int", help="iteration count", default=100)
	parser.add_option("-s", dest="seed", type="int", help="random seed", default=None)
	parser.add_option("-n", dest="samplesize", type="int", help="dataset sample size", default=100)
	(options, args) = parser.parse_args()
	random.seed(options.seed)
	numpy.random.seed(options.seed)
	
	idlist = random.sample(reuters.fileids(), options.samplesize)

	labels = []
	corpus = []
	labelset = []

	result_set=[];
	cur.execute("SELECT distinct topic from topic_words where category = 'Shoes'")
	for row in cur:
		topicset = []
		topicset.append(row[0])
		labels.append(topicset)
		labelset.append(row[0])
		wordlist = []
		cur1 = conn.cursor()
		cur1.execute("SELECT word from topic_words where category = 'Shoes' and topic = '"+row[0]+"' order by weight desc")
		for word in cur1:
			wordlist.append(word[0])
		print wordlist
		corpus.append([x.lower() for x in wordlist if x!='' and (x[0] in string.ascii_letters)])	

	llda = LLDA(options.K, options.alpha, options.beta)
	llda.set_corpus(labelset, corpus, labels)

	# print "M=%d, V=%d, L=%d, K=%d" % (len(corpus), len(llda.vocas), len(labelset), options.K)

	for i in range(options.iteration):
	    sys.stderr.write("-- %d : %.4f\n" % (i, llda.perplexity()))
	    llda.inference()
	print "perplexity : %.4f" % llda.perplexity()

	phi = llda.phi()
	cur.execute("delete from topic_words where category = '"+cats+"'")
	
	for k, label in enumerate(labelset):
	    print "\n-- label %d : %s" % (k, label)
	    if (label!= "common"):
	    	for w in numpy.argsort(-phi[k])[:20]:
	    	   	print "%s: %.4f" % (llda.vocas[w], phi[k,w])
	    	   	cur.execute("INSERT INTO topic_words (category, topic, word, weight) VALUES ('Shoes', '"+label+"','"+llda.vocas[w]+"', phi[k,w]) ON DUPLICATE KEY UPDATE  weight=VALUES(weight)")	    
	cur.execute("delete from topic_detail where category = '"+cats+"'")
	cur.execute("delete from topic_date_detail where category = '"+cats+"'")
	cur.execute("Insert into topic_detail select t1.topic, t1.pos_count, t2.neg_Count, (t1.pos_count+t2.neg_Count) total_count,'Shoes' from  (select a.topic, count(b.word) pos_count from topic_words a, comment_words b where a.word = b.word    and  b.score >3 group by a.topic)t1,(select a.topic, count(b.word) neg_count from topic_words a, comment_words b where a.word = b.word    and  b.score < 3 group by a.topic) t2 where t1.topic = t2.topic") 
	cur.execute("insert into topic_date_detail select t1.topic, t1.c_date, t1.pos_count, t1.pos_words, t2.neg_count, t2.neg_words,'Shoes' from (select a.topic, b.c_date, count(a.word) pos_count, GROUP_CONCAT(distinct(b.word)) pos_words from topic_words a, comment_words b  where a.word = b.word    and  b.score >3  group by a.topic,b.c_date )t1, (select a.topic, b.c_date, count(a.word) neg_count, GROUP_CONCAT(distinct(b.word)) neg_words from topic_words a, comment_words b  where a.word = b.word    and  b.score < 3  group by a.topic,b.c_date )t2 where t1.topic = t2.topic and t1.c_date= t2.c_date") 
	
@mod_data.route('/topic6')
def topic_mod6():
	## for creating a new topic
	topic = request.args.get('topic', '')
	cat = request.args.get('category', '')
	cur.execute("INSERT INTO topic_words (category, topic) VALUES ('"+cat+"', '"+topic+"') ON DUPLICATE KEY UPDATE  topic=VALUES(topic)")
	return "hello";

@mod_data.route('/topic7')
def topic_mod7():
	## for deleting words from topics
	topics = request.args.get('topics', '')
	cat = request.args.get('category', '')
	words = request.args.get('words', '')

	wordList = words.split(",")
	topicList = topics.split(",")

	for word in wordList:
		for topic in topicList:
			cur.execute("delete from topic_words where category = '"+cat+"' and topic = '"+topic+"' and word = '"+word+"'")	
	cur.execute("delete from topic_detail where category = '"+cats+"'")
	cur.execute("delete from topic_date_detail where category = '"+cats+"'")
	cur.execute("Insert into topic_detail select t1.topic, t1.pos_count, t2.neg_Count, (t1.pos_count+t2.neg_Count) total_count,'Shoes' from  (select a.topic, count(b.word) pos_count from topic_words a, comment_words b where a.word = b.word    and  b.score >3 group by a.topic)t1,(select a.topic, count(b.word) neg_count from topic_words a, comment_words b where a.word = b.word    and  b.score < 3 group by a.topic) t2 where t1.topic = t2.topic") 
	cur.execute("insert into topic_date_detail select t1.topic, t1.c_date, t1.pos_count, t1.pos_words, t2.neg_count, t2.neg_words,'Shoes' from (select a.topic, b.c_date, count(a.word) pos_count, GROUP_CONCAT(distinct(b.word)) pos_words from topic_words a, comment_words b  where a.word = b.word    and  b.score >3  group by a.topic,b.c_date )t1, (select a.topic, b.c_date, count(a.word) neg_count, GROUP_CONCAT(distinct(b.word)) neg_words from topic_words a, comment_words b  where a.word = b.word    and  b.score < 3  group by a.topic,b.c_date )t2 where t1.topic = t2.topic and t1.c_date= t2.c_date") 
	return "hello"

@mod_data.route('/topic8')
def topic_mod8():
	## For retrieving products
	topics = request.args.get('topics', '')
	cat = request.args.get('category', '')
	sortby = request.args.get('sortby', '')
	topicList = topics.split(",")
	wordList = "";
	# for topic in topicList:
	# 	cur.execute("SELECT word from topic_words where category = '"+cat+"' and topic = '"+topic+"'")
	# 	for row in cur:
	# 		wordList = wordList+row[0]+","
	# wordList = wordList[:-1]
	# wordList = "'"+wordList.replace(",", "','")+"'";
	# print wordList;
	# cur.execute("select distinct c_id from comment_words where word in ("+wordList+")")
	# result = []
	# for row in cur:
	# 	record = {}
	# 	cur1 = conn.cursor()
	# 	cur1.execute("SELECT price, score, title from product_details where category = '"+cat+"' and id = '"+str(row[0])+"'  and price != 'unknown'");
	# 	for row1 in cur1:
	# 		record["price"] = row1[0];
	# 		record["score"] = row1[1];
	# 		record["title"] = row1[2];
	# 		result.append(record)
	
	for topic in topicList:
		cur.execute("SELECT word from topic_words where category = '"+cat+"' and topic = '"+topic+"' order by weight desc")
		for row in cur:
			wordList = wordList+row[0]+" "
	wordList = wordList[:-1]
	print wordList;
	print "select distinct price, score,title, prodDesc, MATCH (comment_text) AGAINST ('"+wordList+"') as match_val from product_details where category = '"+cat+"' and MATCH (comment_text) AGAINST ('"+wordList+"') >0 and price!= 'unknown' order by match_val desc";
	cur.execute("select distinct price, score,title, prodDesc, MATCH (comment_text) AGAINST ('"+wordList+"') as match_val from product_details where category = '"+cat+"' and MATCH (comment_text) AGAINST ('"+wordList+"') >0 and price!= 'unknown' order by match_val desc");
	result = []
	for row in cur:
		record = {}
		record["price"] = row[0];
		record["score"] = row[1];
		record["title"] = row[2];
		record["desc"] = row[3];
		result.append(record)

	result1 = sorted(result, key=lambda record: record[sortby]) 
	if (sortby == "price"):
		result1 = sorted(result, key=lambda record: float(record[sortby])) 
	return simplejson.dumps(list(reversed(result1)));

@mod_data.route('/topic9')
def topic_mod9():
	word = request.args.get('word', '')
	cats = request.args.get('category', '')
	topic = request.args.get('topic', '')
	weight = request.args.get('weight', '')
	cur.execute("update topic_words set weight = "+weight+" where topic = '"+topic+"' and word = '"+word+"' and category = '"+cats+"'")
	return "hello"
