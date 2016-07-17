
# coding: utf-8

# # Syntax Net to Story Graph
# 
# Must have:
# * --**I**-- means the speaker
# 
# Parts of speech want to visualize:
# * Nouns
# * Adjectives.

# ### The Hare and the Tortoise
# 
# _There once was a speedy Rabbit who bragged about how fast he could run. Tired of hearing him boast, the Tortoise challenged him to a race. All the animals in the forest gathered to watch._
# 
# ### The cunning Fox and the Stork
# 
# _Once upon a time, there lived a very cunning and mischievous fox. He used to speak to other animals sweetly and gain their trust, before playing tricks on them. One day the fox met a crow. He befriended the crow and acted like a very good friend. Soon, he invited the crow to have a feast with him. The crow happily accepted the invitation._
# 
# ### The Ant and the Grasshopper
# 
# _In a field one summer's day a Grasshopper was hopping about, chirping and singing to its heart's content. An Ant passed by, bearing along with great effort an ear of corn he was taking to the nest._

# In[180]:

TEST_PHRASE = "All the animals in the forest gathered to watch."


# In[181]:

import json
import requests

SYNTAX_NET_HOST = "http://130.211.127.78:3033"

def get_syntax_net_graph(text):
    payload = { "input": text }
    r = requests.post(SYNTAX_NET_HOST + "/syntaxnet", data=json.dumps(payload), headers={"content-type" : "application/json"})
    return r.json()

raw_graph = get_syntax_net_graph(TEST_PHRASE.replace(".", ""))


# In[182]:

get_ipython().magic('matplotlib inline')

import matplotlib
import networkx as nx
import numpy as np
import matplotlib.pyplot as plt

matplotlib.rcParams['figure.figsize'] = (20.0, 10.0)

def draw_graph(edges):
    G = nx.DiGraph()
    G.add_edges_from(edges)

    values = [1.0 for node in G.nodes()]

    # Specify the edges you want here
    edge_colours = ['black' for edge in G.edges()]
    black_edges = [edge for edge in G.edges()]

    # Need to create a layout when doing
    # separate calls to draw nodes and edges
    pos = nx.spring_layout(G)
    nx.draw_networkx_nodes(G, pos, cmap=plt.get_cmap('Reds'), node_color = values, node_size=4800)
    nx.draw_networkx_edges(G, pos, edgelist=black_edges, arrows=True)
    nx.draw_networkx_labels(G,pos,font_size=12,font_family='sans-serif')
    
    plt.axis('off')
    plt.show()


# In[183]:

class Node(object):
    
    def __init__(self, id, head_id=None, form=None, cpostag=None, deprel=None):
        if id == u'0':
            raise ValueError('ID cannot be 0')

        self.id = id
        self.head_id = head_id
        self.form = form
        self.pos = cpostag
        self.rel = deprel
        
        # poor man's lazy init
        self.done = True
        if (form is None or
            cpostag is None or
            deprel is None or
            head_id is None):
            self.done = False
        
        self.inbound = []
        self.outbound = []
    
    def lazy_init(self, head_id, form, cpostag, deprel):
        if head_id is None or form is None or cpostag is None or deprel is None:
            raise ValueError("Cannot have form, pos or rel being None")
        
        self.head_id = head_id
        self.form = form
        self.pos = cpostag
        self.rel = deprel
        
        self.done = True
    
    # TODO(bogdan): Make this a property :-)
    def is_done(self):
        return self.done
    
    def add_inbound_edge(self, from_id):
        self.inbound.append(from_id)
    
    def add_outbound_edge(self, to_id):
        self.outbound.append(to_id)
        
    def _label(self):
        return str(self.id) + "-" + str(self.form) + "-" + str(self.pos) + "-" + str(self.rel)
    
    def __str__(self):
        return self._label()
    
    def __repr__(self):
        return self._label()

class Graph(object):
    
    def __init__(self, raw_graph):
        self.root = None
        self.raw_nodes = dict([(node['id'], node) for node in raw_graph ])
        
        self.nodes = {}
        
        for raw_node in raw_graph:
            node_id = raw_node["id"]
            node_head_id = raw_node["head"]
            
            if node_id in self.nodes:
                node = self.nodes[node_id]
                
                # if not is partial, then populate the other fields
                if node.is_done() is False:
                    head_id = node_head_id
                    if head_id is '0':
                        head_id = -1
                    node.lazy_init(head_id = head_id,
                                   form = raw_node["form"],
                                   cpostag = raw_node["cpostag"],
                                   deprel = raw_node["deprel"])
            else:
                head_id = node_head_id
                if head_id is '0':
                    head_id = -1
                
                # Create the node
                node = Node(node_id,
                            head_id = head_id,
                            form = raw_node["form"],
                            cpostag = raw_node["cpostag"],
                            deprel = raw_node["deprel"])
                self.nodes[node_id] = node
            
            # each raw_node has an ID and a head -- add edge from ID to head, add edge from head to ID
            if node_head_id == u'0':
                continue
            
            # if head node doesn't exist then create it, the rest of the info is going
            # to be filled in lazily later.
            if node_head_id in self.nodes:
                node_head = self.nodes[node_head_id]
            else:
                node_head = Node(node_head_id)
                self.nodes[node_head_id] = node_head
            
            node.add_outbound_edge(node_head_id)
            node_head.add_inbound_edge(node_id)
        
        # Health check
        for node_id, node in self.nodes.items():
            if node.is_done() is False:
                raise ValueError("There was a problem with building the graph")
            
            if node.rel == 'ROOT':
                self.root = node
        
        # Tranform
        self.transform()
    
    """
    Multiple rules need to be applied for this graph.
    """
    def transform(self):
        nb_of_nodes = len(self.nodes)
        
        while True:
            self._remove(lambda x: x.pos == "VERB" and len(x.inbound) == 0)
            self._remove(lambda x: x.pos == "ADV" and len(x.inbound) == 0)
            self._remove(lambda x: x.pos == "CONJ" and len(x.inbound) == 0)
            
            self._remove(lambda x: x.rel == "punct" and len(x.inbound) == 0)
            self._remove(lambda x: x.rel == "pobj" and len(x.inbound) == 0)

            self._compact(lambda x: x.pos == "ADP")
            self._compact(lambda x: x.pos == "DET")
            
            #self._find_and_adnotate(lambda x: x.pos == "PRON", lambda x: x.pos == "NOUN")
            
            if len(self.nodes) == nb_of_nodes:
                break
            
            nb_of_nodes = len(self.nodes)
    
    def _find_and_adnotate(self, from_where, find_what):
        from_where = [
            node_id
            for node_id, node in self.nodes.items()
            if from_where(node)
        ]
        
        for node_id in from_where:
            found = self._dfs(node_id, find_what)
            
            for found_id in found:
                start_node = self.nodes[node_id]
                found_node = self.nodes[found_id]
                
                start_node.pos = found_node.pos + "*CHANGED"
                start_node.form = found_node.form
                start_node.rel = start_node.rel
                
                # only one noun at a time.
                break
            
    
    def _dfs(self, stat_node_id, find_what):
        stack = [stat_node_id]
        visited = {}
        found = []
        
        while len(stack) > 0:
            current_id = stack[-1]
            visited[current_id] = True
            
            if find_what(self.nodes[current_id]):
                found.append(current_id)
            
            added = False
            for node_id in self.nodes[current_id].outbound:
                if node_id not in visited:
                    stack.append(node_id)
                    added = True
                    break
            if added == False:
                stack.pop()
        
        return found
    
    def _compact(self, condition):
        to_compact = [
            node_id
            for node_id, node in self.nodes.items()
            if condition(node)
        ]
        
        for node_id in to_compact:
            node_to_compact = self.nodes[node_id]
            head_node = self.nodes[node_to_compact.head_id]
            
            head_node.inbound.remove(node_to_compact.id)
            
            for inbound_of_compact in node_to_compact.inbound:
               head_node.inbound.append(inbound_of_compact)
               self.nodes[inbound_of_compact].outbound.remove(node_to_compact.id)
               self.nodes[inbound_of_compact].outbound.append(head_node.id)
               self.nodes[inbound_of_compact].head_id = head_node.id
            
            del self.nodes[node_to_compact.id]
    
    def _remove(self, condition):
        remove_ids = [
            node_id
            for node_id, node in self.nodes.items()
            if condition(node)
        ]
        
        for node_id in remove_ids:
            head_id_for_removal_node = self.nodes[node_id].head_id
            head_node = self.nodes[head_id_for_removal_node]
            head_node.inbound.remove(node_id)
            
            del self.nodes[node_id]
    
    def _neighbours(self, current_node_id):
        neighbours = []
        
        for node_id in self.nodes[current_node_id].inbound:
            neighbours.append(node_id)
        
        for node_id in self.nodes[current_node_id].outbound:
            neighbours.append(node_id)
        
        return neighbours
    
    def find_strings(self):
        if self.root.pos == "NOUN":
            candidates = []
            neighbours = self._neighbours(self.root.id)
            
            for node_id in neighbours:
                node = self.nodes[node_id]
                if node.pos == "ADJ" or node.pos == "VERB":
                    candidates.append(node_id)
            
            for node_id in neighbours:
                out_node = self.nodes[node_id]
                if out_node.pos != "VERB":
                    continue

                double_neighbours = self._neighbours(node_id)
                
                for neighbour_id in double_neighbours:
                    node = self.nodes[neighbour_id]
                    if node.pos == "VERB":
                        candidates.append(neighbour_id)
            
            words = set()
            for node_id in candidates:
                words.add(self.nodes[node_id].form)
            
            words.add(self.root.form)
            return words
            
        elif self.root.pos == "VERB":
            candidates = []
            neighbours = self._neighbours(self.root.id)
            
            for node_id in neighbours:
                node = self.nodes[node_id]
                
                if (node.rel == "nsubj" or
                    node.pos == "ADV"
                    or (node.pos == "VERB" and node.rel != "partmod")):
                    candidates.append(node_id)
            
            words = set()
            for node_id in candidates:
                words.add(self.nodes[node_id].form)
            
            words.add(self.root.form)
            return words
            
    def show(self):
        edges = []
        for node_id, node in self.nodes.items():
            if node.head_id == '0':
                continue
            
            head_node = self.nodes[node.head_id]
            
            edges.append(
                (
                    node._label(),
                    head_node._label()
                )
            )
        
        draw_graph(edges)


print TEST_PHRASE
graph = Graph(raw_graph)
graph.show()
print graph.find_strings()

# phrase -> graph -> a list of descriptions [ adj noun verb adv ]
# nount (root) -> verb -> verb(multiple-descriptions).


# In[ ]:




# In[ ]:



