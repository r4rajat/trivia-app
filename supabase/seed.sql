-- Verified against Government of India history resources. Options are intentionally
-- stored here; correct_option is zero-based and never exposed by client RPCs.
insert into public.questions (question_order, question_text, option_a, option_b, option_c, option_d, correct_option) values
(1, 'When did India gain independence from British rule?', '26 January 1950', '15 August 1947', '15 August 1948', '26 November 1949', 1),
(2, 'Who was the first Prime Minister of independent India?', 'Sardar Vallabhbhai Patel', 'Dr. Rajendra Prasad', 'Jawaharlal Nehru', 'Lal Bahadur Shastri', 2),
(3, 'Who designed the Indian National Flag?', 'Rabindranath Tagore', 'Pingali Venkayya', 'Mahatma Gandhi', 'B. R. Ambedkar', 1),
(4, 'Where did Jawaharlal Nehru deliver his “Tryst with Destiny” speech?', 'Red Fort', 'Parliament House', 'India Gate', 'Rashtrapati Bhavan', 1),
(5, 'Who is popularly known as the “Father of the Nation” in India?', 'Bhagat Singh', 'Mahatma Gandhi', 'Bal Gangadhar Tilak', 'Gopal Krishna Gokhale', 1),
(6, 'Which movement was launched by Mahatma Gandhi in 1942?', 'Non-Cooperation Movement', 'Civil Disobedience Movement', 'Quit India Movement', 'Swadeshi Movement', 2),
(7, 'What was the slogan associated with the Quit India Movement?', 'Jai Jawan Jai Kisan', 'Do or Die', 'Inquilab Zindabad', 'Swaraj is my birthright', 1),
(8, 'Who gave “Jai Hind” its popular association with the Indian freedom movement?', 'Subhas Chandra Bose', 'Bhagat Singh', 'Chandra Shekhar Azad', 'Jawaharlal Nehru', 0),
(9, 'Who led the Azad Hind Fauj in its later, most famous form?', 'Rash Behari Bose', 'Subhas Chandra Bose', 'Mohan Singh', 'Sarojini Naidu', 1),
(10, 'Which incident in 1919 became a major turning point in India’s freedom struggle?', 'Kakori Conspiracy', 'Jallianwala Bagh massacre', 'Chauri Chaura incident', 'Dandi March', 1),
(11, 'Who was the Viceroy of India when India became independent?', 'Lord Curzon', 'Lord Wavell', 'Lord Mountbatten', 'Lord Irwin', 2),
(12, 'Which act provided the legal framework for partition and independence in 1947?', 'Government of India Act 1935', 'Indian Councils Act 1909', 'Indian Independence Act 1947', 'Regulating Act 1773', 2),
(13, 'Who was the first President of independent India?', 'Dr. Rajendra Prasad', 'Dr. S. Radhakrishnan', 'Zakir Husain', 'V. V. Giri', 0),
(14, 'Who is known as the “Iron Man of India”?', 'Sardar Vallabhbhai Patel', 'Subhas Chandra Bose', 'Lala Lajpat Rai', 'Dadabhai Naoroji', 0),
(15, 'The Dandi March of 1930 was primarily associated with which issue?', 'Land revenue', 'Salt tax and monopoly', 'Separate electorates', 'Indigo cultivation', 1),
(16, 'Who wrote “Jana Gana Mana”?', 'Bankim Chandra Chattopadhyay', 'Rabindranath Tagore', 'Sarojini Naidu', 'Muhammad Iqbal', 1),
(17, '“Vande Mataram” was written by whom?', 'Rabindranath Tagore', 'Bankim Chandra Chattopadhyay', 'Sri Aurobindo', 'Maithili Sharan Gupt', 1),
(18, 'How many spokes are there in the Ashoka Chakra?', '12', '18', '24', '32', 2),
(19, 'Who chaired the Drafting Committee of the Indian Constitution?', 'Dr. B. R. Ambedkar', 'Jawaharlal Nehru', 'Dr. Rajendra Prasad', 'B. N. Rau', 0),
(20, 'Which princely state was integrated into the Indian Union through military action in 1948?', 'Junagadh', 'Kashmir', 'Hyderabad', 'Mysore', 2)
on conflict (question_order) do update set question_text=excluded.question_text, option_a=excluded.option_a, option_b=excluded.option_b, option_c=excluded.option_c, option_d=excluded.option_d, correct_option=excluded.correct_option;

-- Keep an existing project consistent if the seed is rerun.
update public.questions set time_limit = 15;
